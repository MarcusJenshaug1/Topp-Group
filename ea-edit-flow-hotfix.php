<?php
/**
 * Plugin Name: EA – Edit Flow Gutenberg Fix
 * Description: Forhindrer "ef_default_custom_status is not defined" (Edit Flow) fra å krasje blokkeredigereren.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

/**
 * Sett til true hvis du heller vil deaktivere Edit Flow sin custom status-blokk helt
 * (da forsvinner feilen uansett, men funksjonen i editoren blir borte).
 */
const EA_EF_DISABLE_CUSTOM_STATUS_BLOCK = false;

function ea_is_block_editor_screen(): bool {
  if (!function_exists('get_current_screen')) return false;
  $screen = get_current_screen();
  if (!$screen) return false;

  // WP har hatt ulike varianter over tid
  if (method_exists($screen, 'is_block_editor') && $screen->is_block_editor()) return true;

  // Fallback: de vanligste editor-skjermene
  return in_array($screen->base, ['post', 'site-editor'], true);
}

/**
 * Viktig: Må ligge i global scope (ikke inni en funksjon i JS),
 * slik at "ef_default_custom_status" faktisk eksisterer som global variabel.
 */
function ea_ef_guard_js(): string {
  return <<<JS
/* EA Edit Flow guard */
window.ef_default_custom_status = window.ef_default_custom_status || globalThis.ef_default_custom_status || {};
globalThis.ef_default_custom_status = window.ef_default_custom_status;
var ef_default_custom_status = window.ef_default_custom_status;
JS;
}

/**
 * 1) Prøv å hooke oss "før" Edit Flow sitt script (ideelt).
 */
add_action('enqueue_block_editor_assets', function () {
  if (!ea_is_block_editor_screen()) return;

  $wp_scripts = wp_scripts();
  $guard = ea_ef_guard_js();

  // Finn Edit Flow-handle ved å matche src
  $ef_handle = null;
  foreach ($wp_scripts->queue as $h) {
    $reg = $wp_scripts->registered[$h] ?? null;
    $src = $reg->src ?? '';
    if ($src && strpos($src, 'edit-flow/build/custom-status-block.js') !== false) {
      $ef_handle = $h;
      break;
    }
  }

  // Hvis du vil deaktivere blokka helt
  if (EA_EF_DISABLE_CUSTOM_STATUS_BLOCK && $ef_handle) {
    wp_dequeue_script($ef_handle);
    wp_deregister_script($ef_handle);
    return;
  }

  // Beste tilfelle: legg inline før Edit Flow sitt script
  if ($ef_handle) {
    wp_add_inline_script($ef_handle, $guard, 'before');
    return;
  }

  // Fallback: legg inline før core editor-script
  if (wp_script_is('wp-edit-post', 'enqueued')) {
    wp_add_inline_script('wp-edit-post', $guard, 'before');
  } elseif (wp_script_is('wp-edit-site', 'enqueued')) {
    wp_add_inline_script('wp-edit-site', $guard, 'before');
  }
}, 999);

/**
 * 2) Ekstra failsafe: print direkte i <head> på editor-skjermen.
 * Dette dekker tilfeller hvor scripts blir flyttet/optimalisert på uheldig vis.
 */
add_action('admin_head', function () {
  if (!ea_is_block_editor_screen()) return;

  $guard = ea_ef_guard_js();
  echo "<script>{$guard}</script>";
}, 1);

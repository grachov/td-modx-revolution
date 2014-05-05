<?php
$startTime = microtime(true);
set_time_limit(0);

require_once dirname(__FILE__) . '/build.config.php';

$root = dirname(dirname(__FILE__)) . '/';
$sources = array(
	'root' => $root,
	'build' => $root . '_build/',
	'data' => $root . '_build/data/',
	'resolvers' => $root . '_build/resolvers/',
	'chunks' => $root . 'core/components/' . PKG_NAME_LOWER . '/elements/chunks/',
	'snippets' => $root . 'core/components/' . PKG_NAME_LOWER . '/elements/snippets/',
	'plugins' => $root . 'core/components/' . PKG_NAME_LOWER . '/elements/plugins/',
	'lexicon' => $root . 'core/components/' . PKG_NAME_LOWER . '/lexicon/',
	'docs' => $root . 'core/components/' . PKG_NAME_LOWER . '/docs/',
	'pages' => $root . 'core/components/' . PKG_NAME_LOWER . '/elements/pages/',
	'source_assets' => $root . 'assets/components/' . PKG_NAME_LOWER,
	'source_core' => $root . 'core/components/' . PKG_NAME_LOWER,
);

require_once MODX_CORE_PATH . 'model/modx/modx.class.php';
require_once $sources['build'] . '/includes/functions.php';

$modx = new modX();
$modx->initialize('mgr');

echo '<pre>';

$modx->setLogLevel(modX::LOG_LEVEL_INFO);
$modx->setLogTarget('ECHO');
$modx->getService('error', 'error.modError');

$modx->loadClass('transport.modPackageBuilder', '', false, true);

$builder = new modPackageBuilder($modx);
$builder->createPackage(PKG_NAME_LOWER, PKG_VERSION, PKG_RELEASE);
$builder->registerNamespace(PKG_NAME_LOWER, false, true, '{core_path}components/' . PKG_NAME_LOWER . '/');

$modx->log(modX::LOG_LEVEL_INFO, 'Created Transport Package and Namespace.');

$settings = include $sources['data'] . 'transport.settings.php';
if (is_array($settings)) {
	$attributes = array(
		xPDOTransport::UNIQUE_KEY => 'key',
		xPDOTransport::PRESERVE_KEYS => true,
		xPDOTransport::UPDATE_OBJECT => BUILD_SETTING_UPDATE,
	);
	foreach ($settings as $setting) {
		$vehicle = $builder->createVehicle($setting, $attributes);
		$builder->putVehicle($vehicle);
	}
	$modx->log(modX::LOG_LEVEL_INFO, 'Packaged in ' . count($settings) . ' system settings.');
} else {
	$modx->log(modX::LOG_LEVEL_ERROR, 'No system settings found for packaging.');
}
unset($settings, $setting, $attributes);

$modx->log(xPDO::LOG_LEVEL_INFO, 'Packaging menus.');
$menus = include $sources['data'] . 'transport.menu.php';
if (is_array($menus)) {
	$attributes = array(
		xPDOTransport::PRESERVE_KEYS => true,
		xPDOTransport::UPDATE_OBJECT => BUILD_MENU_UPDATE,
		xPDOTransport::UNIQUE_KEY => 'text',
		xPDOTransport::RELATED_OBJECTS => true,
		xPDOTransport::RELATED_OBJECT_ATTRIBUTES => array(
			'Action' => array(
				xPDOTransport::PRESERVE_KEYS => false,
				xPDOTransport::UPDATE_OBJECT => BUILD_ACTION_UPDATE,
				xPDOTransport::UNIQUE_KEY => array(
					'namespace',
					'controller',
				),
			),
		),
	);
	foreach ($menus as $menu) {
		/**
		 * @var modMenu $menu
		 */
		$vehicle = $builder->createVehicle($menu, $attributes);
		$builder->putVehicle($vehicle);
		$modx->log(modX::LOG_LEVEL_INFO, 'Packaged in menu "' . $menu->get('text') . '".');
	}
} else {
	$modx->log(modX::LOG_LEVEL_ERROR, 'No menus found for packaging.');
}
unset($vehicle, $menus, $menu, $attributes);

$modx->log(xPDO::LOG_LEVEL_INFO, 'Creating category.');
/**
 * @var modCategory $category
 */
$category = $modx->newObject('modCategory');
$category->fromArray(array(
	'id' => 1,
	'category' => PKG_NAME,
), '', true, true);

$modx->log(xPDO::LOG_LEVEL_INFO, 'Packaging plugins.');
$plugins = include $sources['data'] . 'transport.plugins.php';
if (!is_array($plugins)) {
	$modx->log(modX::LOG_LEVEL_ERROR, 'No plugins found for packaging.');
} else {
	$category->addMany($plugins);
	$modx->log(modX::LOG_LEVEL_INFO, 'Packaged in ' . count($plugins) . ' plugins.');
}

$attributes = array(
	xPDOTransport::UNIQUE_KEY => 'category',
	xPDOTransport::PRESERVE_KEYS => false,
	xPDOTransport::UPDATE_OBJECT => true,
	xPDOTransport::RELATED_OBJECTS => true,
	xPDOTransport::RELATED_OBJECT_ATTRIBUTES => array(
		'Plugins' => array(
			xPDOTransport::PRESERVE_KEYS => false,
			xPDOTransport::UPDATE_OBJECT => BUILD_PLUGIN_UPDATE,
			xPDOTransport::UNIQUE_KEY => 'name',
		),
		'PluginEvents' => array(
			xPDOTransport::PRESERVE_KEYS => true,
			xPDOTransport::UPDATE_OBJECT => BUILD_EVENT_UPDATE,
			xPDOTransport::UNIQUE_KEY => array(
				'pluginid',
				'event',
			),
		),
	),
);

$vehicle = $builder->createVehicle($category, $attributes);

$vehicle->resolve('file', array(
	'source' => $sources['source_assets'],
	'target' => "return MODX_ASSETS_PATH . 'components/';",
));
$vehicle->resolve('file', array(
	'source' => $sources['source_core'],
	'target' => "return MODX_CORE_PATH . 'components/';",
));

flush();

$builder->putVehicle($vehicle);

$builder->setPackageAttributes(array(
	'changelog' => file_get_contents($sources['docs'] . 'changelog.txt'),
	'license' => file_get_contents($sources['docs'] . 'license.txt'),
	'readme' => file_get_contents($sources['docs'] . 'readme.txt'),
));
$modx->log(modX::LOG_LEVEL_INFO, 'Added package attributes.');

$modx->log(modX::LOG_LEVEL_INFO, 'Packing up transport package.');
$builder->pack();

$modx->log(modX::LOG_LEVEL_INFO, 'Package Built.');

$totalTime = sprintf('%2.4f s', microtime(true) - $startTime);

$signature = $builder->getSignature();

$modx->log(modX::LOG_LEVEL_INFO, 'Execution time: ' . $totalTime);

echo '</pre>';

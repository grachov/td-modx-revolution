<?php
require_once dirname(dirname(dirname(dirname(__FILE__)))) . '/config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$corePath = $modx->getOption('trackduck.core_path', null, $modx->getOption('core_path') . 'components/trackduck/');
$modx->addPackage('trackduck', $corePath . 'model/');
$manager = $modx->getService('trackduck');
$modx->request->handleRequest(array(
	'processors_path' => $manager->getOption('processorsPath', $corePath . 'processors/'),
	'location' => 'mgr',
));

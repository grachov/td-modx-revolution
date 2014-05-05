<?php
$result = array();

$settings = array(
	'trackduck.show_mgr_context' => array(
		'value' => false,
		'xtype' => 'combo-boolean',
	),
	'trackduck.expert_mode' => array(
		'value' => false,
		'xtype' => 'combo-boolean',
	),
);

foreach ($settings as $k => $v) {
	/**
	 * @var modSystemSetting $setting
	 */
	$setting = $modx->newObject('modSystemSetting');
	$setting->fromArray(array_merge(array(
		'key' => $k,
		'namespace' => 'trackduck',
		'area' => 'trackduck.system',
	), $v), '', true, true);
	$result[] = $setting;
}

unset($settings, $setting);
return $result;

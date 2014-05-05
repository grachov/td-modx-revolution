<?php
$result = array();

$menus = array(
	'trackduck.title' => array(
		'description' => 'trackduck.description',
		'parent' => 'components',
		'menuindex' => 0,
		'action' => array(
			'controller' => 'index',
		),
	),
);

foreach ($menus as $k => $v) {
	$action = null;
	if (!empty($v['action'])) {
		/**
		 * @var modAction $action
		 */
		$action = $modx->newObject('modAction');
		$action->fromArray(array_merge(array(
			'id' => 1,
			'namespace' => PKG_NAME_LOWER,
			'parent' => 0,
			'haslayout' => 1,
			'lang_topics' => PKG_NAME_LOWER . ':default',
			'assets' => '',
		), $v['action']), '', true, true);
		unset($v['action']);
	}
	/**
	 * @var modMenu $menu
	 */
	$menu = $modx->newObject('modMenu');
	$menu->fromArray(array_merge(array(
		'text' => $k,
		'parent' => 'components',
		'icon' => 'images/icons/plugin.gif',
		'menuindex' => 0,
		'params' => '',
		'handler' => '',
	), $v), '', true, true);

	if (!empty($action) && $action instanceof modAction) {
		$menu->addOne($action);
	}
	$result[] = $menu;
}

unset($menus, $action, $menu);
return $result;

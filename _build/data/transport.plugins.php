<?php
$result = array();

$plugins = array(
	'TrackDuck' => array(
		'file' => 'trackduck',
		'description' => '',
		'events' => array(
			'OnLoadWebDocument',
		),
	),
);

foreach ($plugins as $k => $v) {
	/**
	 * @var modPlugin $plugin
	 */
	$plugin = $modx->newObject('modPlugin');
	$plugin->fromArray(array(
		'id' => 0,
		'name' => $k,
		'category' => 0,
		'description' => isset($v['description']) ? $v['description'] : '',
		'plugincode' => getSnippetContent($sources['source_core'] . '/elements/plugins/' . $v['file'] . '.php'),
		'static' => 0,
		'source' => 1,
		'static_file' => 'core/components/' . PKG_NAME_LOWER . '/elements/plugins/' . $v['file'] . '.php'
	), '', true, true);

	$events = array();
	if (!empty($v['events'])) {
		foreach ($v['events'] as $k2 => $v2) {
			/**
			 * @var modPluginEvent $event
			 */
			$event = $modx->newObject('modPluginEvent');
			$event->fromArray(array(
				'event' => $v2,
				'priority' => 0,
				'propertyset' => 0,
			), '', true, true);
			$events[] = $event;
		}
		unset($v['events']);
	}

	if (!empty($events)) {
		$plugin->addMany($events);
	}

	$properties = include $sources['build'] . 'properties/properties.' . $v['file'] . '.php';
	$plugin->setProperties($properties);

	$result[] = $plugin;
}

unset($plugins, $events, $properties);
return $result;

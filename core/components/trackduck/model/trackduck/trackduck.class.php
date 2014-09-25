<?php
class TrackDuck
{
	protected $modx;
	protected $config = array();

	public function __construct(modX &$modx, $config = array())
	{
		$this->modx = & $modx;
		$basePath = $this->modx->getOption('trackduck.core_path', $config, $this->modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/trackduck/');
		$assetsUrl = $this->modx->getOption('trackduck.assets_url', $config, $this->modx->getOption('assets_url', null, MODX_ASSETS_URL) . 'components/trackduck/');
		$this->config = array_merge(array(
			'basePath' => $basePath,
			'corePath' => $basePath,
			'modelPath' => $basePath . 'model/',
			'processorsPath' => $basePath . 'processors/',
			'templatesPath' => $basePath . 'templates/',
			'chunksPath' => $basePath . 'elements/chunks/',
			'jsUrl' => $assetsUrl . 'js/',
			'cssUrl' => $assetsUrl . 'css/',
			'assetsUrl' => $assetsUrl,
			'connectorUrl' => $assetsUrl . 'connector.php',
			'settingsUrl' => 'https://app.trackduck.com/api/bar/settings/',
			'createProjectUrl' => 'https://app.trackduck.com/#/project/new/step1',
			'loginUrls' => array(
				'google' => 'https://app.trackduck.com/auth/google',
				'facebook' => 'https://app.trackduck.com/auth/Facebook',
				'email' => 'https://app.trackduck.com/auth/login',
			),
			'extensionUrls' => array(
				'chrome' => 'https://chrome.google.com/webstore/detail/trackduck/ekhfapehhkdanmgjkgagafnilhomfkek',
				'firefox' => 'https://trackduck.com/en/content/extensions/firefox-extension/',
			)
		), $config);
	}

	public function getOption($key, $defaul = null)
	{
		return isset($this->config[$key]) ? $this->config[$key] : $defaul;
	}

	public function getConfig()
	{
		return $this->config;
	}

	public function getContexts()
	{
		$contexts = array();
		$query = $this->modx->newQuery('modContext');
		if (!$this->modx->getOption('trackduck.show_mgr_context', null, false)) {
			$query->where(array(
				'key:<>' => 'mgr',
			));
		}
		foreach ($this->modx->getIterator('modContext', $query) as $context) {
			if ($context->prepare()) {
				$contexts[] = array(
					'key' => $context->get('key'),
					'url' => $context->getOption('site_url', $this->modx->getOption('site_url')),
					'project_id' => trim($context->getOption('trackduck.project_id')),
				);
			}
		}
		return $contexts;
	}

	public function setProject($context, $projectId)
	{
		return $this->changeContextSetting($context, 'trackduck.project_id', trim($projectId));
	}

	protected function changeContextSetting($context, $name, $value, $type = 'textfield', $area = 'trackduck.project')
	{
		$criteria = array(
			'context_key' => $context,
			'key' => $name,
		);
		/**
		 * @var modSystemSetting $setting
		 */
		$setting = $this->modx->getObject('modContextSetting', $criteria);
		if (!$setting) {
			$setting = $this->modx->newObject('modContextSetting');
			$setting->fromArray(array_merge($criteria, array(
				'xtype' => $type,
				'namespace' => 'trackduck',
				'area' => $area,
			)), '', true);
		}
		$setting->set('value', $value);
		return $setting->save();
	}
}

<?php
class TrackDuckIndexManagerController extends modExtraManagerController
{
	protected $manager;

	public function __construct(modX &$modx, $config = array())
	{
		parent::__construct($modx, $config);
		$modx->addPackage('trackduck', $modx->getOption('trackduck.core_path', null, $modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/trackduck/') . 'model/');
		$this->manager = $modx->getService('trackduck');
	}

	public function getLanguageTopics()
	{
		return array_merge(parent::getLanguageTopics(), array(
			'trackduck:default',
		));
	}

	public function getPageTitle()
	{
		return $this->modx->lexicon('trackduck.title');
	}

	public function loadCustomCssJs()
	{
		$jsUrl = $this->manager->getOption('jsUrl') . 'mgr/';
		$this->addJavascript($jsUrl . 'trackduck.js');
		$this->addJavascript($jsUrl . 'widgets/windows.js');
		$this->addJavascript($jsUrl . 'widgets/grids.js');
		$this->addJavascript($jsUrl . 'widgets/panels.js');
		$this->addLastJavascript($jsUrl . 'sections/index.js');
		$config = $this->manager->getConfig();
		$config['contexts'] = $this->manager->getContexts();
		$config['returnUrl'] = $this->modx->getOption('url_scheme', null, MODX_URL_SCHEME) . $this->modx->getOption('http_host', null, MODX_HTTP_HOST) . $this->modx->getOption('manager_url', null, MODX_MANAGER_URL) . 'index.php?a=' . intval($_GET['a']);
		$this->addHtml('
<script type="text/javascript">
	Ext.onReady(function() {
		TrackDuck.config = ' . $this->modx->toJSON($config) . ';
	});
</script>
		');
	}

	public function getTemplateFile()
	{
		return $this->manager->getOption('templatesPath') . 'index.tpl';
	}
}

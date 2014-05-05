<?php
/**
 * @property modContext $object
 */
class TrackDuckContextUpdateProcessor extends modObjectProcessor
{
	public $objectType = 'trackduck.context';
	public $classKey = 'modContext';
	public $primaryKeyField = 'key';
	public $languageTopics = array(
		'trackduck:default',
	);

	public function initialize()
	{
		$primaryKey = $this->getProperty($this->primaryKeyField, false);
		if (empty($primaryKey)) {
			return $this->modx->lexicon($this->objectType . '_err_ns');
		}
		$this->object = $this->modx->getObject($this->classKey, $primaryKey);
		if (empty($this->object) || !$this->object->prepare()) {
			return $this->modx->lexicon($this->objectType . '_err_nfs', array(
				$this->primaryKeyField => $primaryKey,
			));
		}
		return true;
	}

	public function process()
	{
		/**
		 * @var TrackDuck $manager
		 */
		$manager = $this->modx->getService('trackduck');
		$context = $this->object->get('key');
		$success = true;
		$projectId = $this->getProperty('project_id');
		if ($projectId !== null) {
			$success = $success && $manager->setProject($context, $projectId);
		}
		if ($success) {
			$cacheManager = $this->modx->getCacheManager();
			if ($cacheManager) {
				$cacheManager->refresh();
			}
			$this->object->prepare(true);
			return $this->success('', $this->getObject());
		}
		return $this->failure('', $this->getObject());
	}

	protected function getObject()
	{
		return array(
			'key' => $this->object->get('key'),
			'url' => $this->object->getOption('site_url', $this->modx->getOption('site_url')),
			'project_id' => trim($this->object->getOption('trackduck.project_id')),
		);
	}
}

return 'TrackDuckContextUpdateProcessor';

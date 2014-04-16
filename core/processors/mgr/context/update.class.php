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
		$manager = $this->modx->getService('trackduck');
		$context = $this->object->get('key');
		$success = true;
		$data = array(
			'key' => $context,
		);
		$projectId = $this->getProperty('project_id');
		if ($projectId !== null) {
			$success = $success && $manager->setProject($context, $projectId);
			if ($success) {
				$data['project_id'] = $projectId;
			}
		}
		$enabled = $this->getProperty('enabled');
		if ($enabled !== null) {
			$success = $success && $manager->changeProjectStatus($context, $enabled);
			if ($success) {
				$data['enabled'] = $enabled;
			}
		}
		if ($success) {
			$cacheManager = $this->modx->getCacheManager();
			if ($cacheManager) {
				$cacheManager->refresh();
			}
			return $this->success('', $data);
		}
		return $this->failure();
	}
}

return 'TrackDuckContextUpdateProcessor';

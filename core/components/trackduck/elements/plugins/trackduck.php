<?php
switch ($modx->event->name) {
	case 'OnLoadWebDocument':
	case 'OnBeforeManagerPageInit':
		$projectId = trim($modx->getOption('trackduck.project_id'));
		if ($projectId !== '' && $projectId != -1) {
			$script = '<script src="//tdcdn.blob.core.windows.net/toolbar/assets/prod/td.js" data-trackduck-id="' . htmlspecialchars($projectId, ENT_COMPAT, $modx->getOption('modx_charset', null, 'UTF-8')) . '" async=""></script>';
			if ($modx->event->name == 'OnBeforeManagerPageInit') {
				$modx->controller->addHtml($script);
			} else {
				$modx->regClientScript($script, true);
			}
		}
		break;
}

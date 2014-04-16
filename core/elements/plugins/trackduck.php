<?php
switch ($modx->event->name) {
	case 'OnLoadWebDocument':
		if ($modx->getOption('trackduck.enabled')) {
			$projectId = trim($modx->getOption('trackduck.project_id'));
			if ($projectId !== '') {
				$modx->regClientScript('<script src="//tdcdn.blob.core.windows.net/toolbar/assets/prod/td.js" data-trackduck-id="' . htmlspecialchars($projectId, ENT_COMPAT, $modx->getOption('modx_charset', null, 'UTF-8')) . '" async=""></script>', true);
			}
		}
		break;
}

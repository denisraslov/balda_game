<?php

include('utility.php');
include('word.php');

function checkWord($word)
{
	$firstLetter = mb_substr($word, 0, 1, 'UTF-8');
	$dict = getDict();
	$result = FALSE;
	
	if (isset($dict['folders'][$firstLetter]))
	{
		$result = in_array($word, $dict['folders'][$firstLetter]);
	}

	return $result;
}

function getFirstWord($size)
{
	$dict = getDict();
	$folders = $dict['folders'];
	
	foreach ($folders as $folder)
	{
		shuffle($folder);
		
		foreach ($folder as $word)
		{		
			if (mb_strlen($word, 'UTF-8') == $size)
			{
				return $word;
			}
		}
	}

	return '';
}

//------------------------------ run ----------------------------------------

if (isset($_GET['action']))
{
	$action = $_GET['action'];

	if (!isset($_GET['params']) || ($params = json_decode($_GET['params'], true)) != NULL)
	{
		switch ($action)
		{
			case 'first_word':
				$result = wrapResponse(getFirstWord($params['size']), 1);
				break;
			case 'check_word':
				$result = wrapResponse(checkWord($params['word']) ? 1 : 0, 1);
				break;
			case 'word':
				$result = wrapResponse(getWord($params['complexity'], $params['size'], $params['map'], $params['used_words']), 1);
				break;
			default:
				$result = wrapResponse('Не найден action', 0);
				break;
		}
	}
	else
	{
		$result = wrapResponse('Неверный формат параметров', 0);
	}
}
else
{
	$result = wrapResponse('Не передан action', 0);
}

echo $result;
	
?>
<?php

function createPDO()
{
	$pdo = new PDO('mysql:host=127.0.0.1;dbname=denis-raslov','root','');
	$pdo->exec('SET NAMES utf8');
	
	return $pdo;
}

function getDict()
{
	$memcache = new Memcache;
	$memcache->connect('unix:///home/users/d/denis-raslov/memcached/memcached.sock', 0);
	
	$dict = $memcache->get('dict5');
	if (!$dict)
	{
		$pdo = createPDO();
		$sql = 'SELECT word FROM words ORDER BY word';
		$query = $pdo->prepare($sql);
		$query->execute();
		$rows = $query->fetchAll(PDO::FETCH_ASSOC);
	
		$wordFolders = Array();
		$reversedWordFolders = Array();
	
		foreach ($rows as $row)
		{
			$word = $row['word'];
			
			$firstLetter = mb_substr($word, 0, 1, 'UTF-8');
			if (!isset($wordFolders[$firstLetter]))
			{
				$wordFolders[$firstLetter] = Array();
			}
			array_push($wordFolders[$firstLetter], $word);	

			$lastLetter = mb_substr($word, mb_strlen($word, 'UTF-8') - 1, 1, 'UTF-8');
			if (!isset($reversedWordFolders[$lastLetter]))
			{
				$reversedWordFolders[$lastLetter] = Array();
			}
			array_push($reversedWordFolders[$lastLetter], $word);	
		}

		$dict = Array(
			'folders' => $wordFolders,
			'reversed_folders' => $reversedWordFolders
		);
		
		$memcache->set('dict5', $dict, 0, 1800);
	}
	
	return $dict;
}

function wrapResponse($data, $result)
{
	return json_encode(array(
			'result' => $result,
			'data' => $data
		)
	);
}

?>
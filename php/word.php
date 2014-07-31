<?php

function getWord($complexity, $size, $map, $usedWords)
{
	foreach ($map as $y => $row)
	{
		foreach ($row as $x => $cell)
		{
			if ($cell['letter'] != '')
			{
				$word = getWordByLetterInMap($complexity, $size, $map, $x, $y, $usedWords);
				
				if ($word != '')
				{
					return Array(
						'word' => $word,
						'map' => $map
						);
				}
				else if (!isset($map['new_added']))
				{
					$cell['checked'] = TRUE;
				}
				
				unset($map['new_added']);
			}
		}	
	}
	
	return $map;
}

function getWordByLetterInMap($complexity, $size, &$map, $x, $y, $usedWords)
{
	$word = getWordBySideLetterInMap($complexity, $size, $map, $x, $y, TRUE, $usedWords);
	if ($word == '')
	{
		$word = getWordBySideLetterInMap($complexity, $size, $map, $x, $y, FALSE, $usedWords);
	}
	
	return $word;
}

function reverseWord($word)
{
	$wordLength = mb_strlen($word, 'UTF-8');
	$reversedWord = '';
	
	for ($i = 0; $i < $wordLength; $i++)
	{
		$reversedWord = mb_substr($word, $i, 1, 'UTF-8') . $reversedWord;
	}
	
	return $reversedWord;
}

function compareStrings($str1, $str2)
{
	iconv('UTF-8', 'ascii//TRANSLIT', $str1);
	iconv('UTF-8', 'ascii//TRANSLIT', $str2);
	
	return strcmp($str1, $str2);
}

function getWordsByLetter($complexity, $letter, $isFirst)
{
	$dict = getDict();
	$prop = $isFirst ? 'folders' : 'reversed_folders';
	
	if (isset($dict[$prop][$letter]))
	{
		$words = $dict[$prop][$letter];
	}
	else
	{
		$words = Array();
	}
	
	if ($complexity)
	{
		usort($words, 'sortWordsByLengthDesc');
	}
	else
	{
		usort($words, 'sortWordsByLengthAsc');
	}

	return $words;
}

function sortWordsByLengthAsc($a, $b)
{
	return mb_strlen($a, 'UTF-8') - mb_strlen($b, 'UTF-8');
}

function sortWordsByLengthDesc($a, $b)
{
	return mb_strlen($b, 'UTF-8') - mb_strlen($c, 'UTF-8');
}

function getWordBySideLetterInMap($complexity, $size, &$map, $x, $y, $isStartLetter, $usedWords)
{
	$letter = $map[$y][$x]['letter'];
	$words = getWordsByLetter($complexity, $letter, $isStartLetter);	
	$word = '';
	
	foreach ($words as $word)
	{	
		$isWordOK = !in_array($word, $usedWords);
		
		if ($isWordOK)
		{
			$preparedWord = $isStartLetter ? $word : reverseWord($word);

			$isWordOK = checkStringInMap($size, $map, $x, $y, mb_substr($preparedWord, 1, mb_strlen($preparedWord, 'UTF-8') - 1, 'UTF-8'));
		}

		if ($isWordOK)
		{
			break;
		}
		else
		{
			$word = '';
		}
	}
	
	return $word;
}

function checkStringByFirstLetterInMap($size, &$map, $x, $y, $firstLetter, $stringPart)
{
	$result = (checkMapLetter($size, $map, $x, $y, $firstLetter) || checkNewMapLetter($size, $map, $x, $y, $firstLetter)) &&
		checkStringInMap($size, $map, $x, $y, $stringPart);

	return $result;
}

function clearNewLetter(&$map, $x, $y)
{
	if (isset($map[$y][$x]['new']) && $map[$y][$x]['new'])
	{
		$map[$y][$x]['new'] = FALSE;
		$map[$y][$x]['letter'] = '';
		$map['new_added'] = FALSE;
	}
}

function checkStringInMap($size, &$map, $x, $y, $string)
{
	$map[$y][$x]['selected'] = TRUE;
	
	if (mb_strlen($string, 'UTF-8') > 0)
	{
		$firstLetter = mb_substr($string, 0, 1, 'UTF-8');
		$stringPart = mb_substr($string, 1, mb_strlen($string, 'UTF-8') - 1, 'UTF-8');
		
		if (checkStringByFirstLetterInMap($size, $map, $x, $y - 1, $firstLetter, $stringPart))
		{
			return TRUE;
		}
		if (checkStringByFirstLetterInMap($size, $map, $x, $y + 1, $firstLetter, $stringPart))
		{
			return TRUE;
		}
		if (checkStringByFirstLetterInMap($size, $map, $x - 1, $y, $firstLetter, $stringPart))
		{
			return TRUE;
		}
		if (checkStringByFirstLetterInMap($size, $map, $x + 1, $y, $firstLetter, $stringPart))
		{
			return TRUE;
		}

		$map[$y][$x]['selected'] = FALSE;	
		
		clearNewLetter($map, $x, $y);
		
		return FALSE;
	}
	else
	{
		if (isNewAdded($map))
		{
			return TRUE;
		}
		else
		{
			$map[$y][$x]['selected'] = FALSE;
			
			return FALSE;
		}
	}
}

function isNewAdded($map)
{
	return isset($map['new_added']) && $map['new_added'];
}

function checkMapLetter($size, $map, $x, $y, $letter)
{
	if ($x < 0 || $x > $size - 1 || $y < 0 || $y > $size - 1)
	{
		return FALSE;
	}
	
	return (!isset($map[$y][$x]['selected']) || $map[$y][$x]['selected'] == FALSE) && 
		compareStrings($map[$y][$x]['letter'], $letter) == 0;
}

function checkNewMapLetter($size, &$map, $x, $y, $letter)
{
	$isAvailable = !isNewAdded($map) && checkMapLetter($size, $map, $x, $y, '');
		
	if ($isAvailable)
	{
		$map[$y][$x]['letter'] = $letter;	
		$map[$y][$x]['new'] = TRUE;
		
		$map['new_added'] = TRUE;
	}
	
	return $isAvailable;
}
	
?>
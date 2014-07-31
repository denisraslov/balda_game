
App.ClearPlayerActions = function(applyLetter)
{
	var letterCellCoords = this.letterCellCoords;
	var letterCell;

	if (letterCellCoords)
	{
		letterCell = this.GetCell(letterCellCoords.x, letterCellCoords.y);
		letterCell.removeClass('letter_cell');
		if (!applyLetter)
		{
			this.SetCell(letterCellCoords.x, letterCellCoords.y);
		}
		delete this.letterCellCoords;
	}

	this.ClearWord();
	this.RefreshLetterAvailableCells();

	$('#letter_selection').hide();
	$('#cancel_wrap').hide();
	$('#word_selection').hide();

	this.isWordSelectionStarted = false;
};

App.GetFieldMap = function()
{
	var fieldSize = this.fieldSize;
	var map = [];
	var rowMap;

	for (var y = 0; y < fieldSize; y++)
	{
		rowMap = [];
		map.push(rowMap);

		for (var x = 0; x < fieldSize; x++)
		{
			rowMap.push({
				letter: this.IsFilledCell(x, y) ? this.GetCellLetter(x, y) : '',
				checked: this.GetCell(x, y).attr('checked')
			});
		}
	}

	return map;
};

App.SetComputerRound = function()
{
	var self = this;

	this.ClearPlayerActions(true);
	this.HideButtons();
	this.SetRound(this.Rounds.COMPUTER);
	this.Query('word', { map: this.GetFieldMap(), used_words: this.GetUsedWords() }, function(data)
	{
		var fieldSize = self.fieldSize;
		var word = data.word;
		var map = data.map;
		var cell;
		var newLetterCell;
		var wordCells = [];

		if (word)
		{
			self.computerSkip = false;

			for (var y = 0; y < fieldSize; y++)
			{
				for (var x = 0; x < fieldSize; x++)
				{
					cell = map[y][x];

					if (cell.new)
					{
						newLetterCell = cell;
						newLetterCell.x = x;
						newLetterCell.y = y;
					}

					if (cell.new || cell.selected)
					{
						wordCells.push({ x: x, y: y });
					}

					if (cell.checked)
					{
						this.GetCell(x, y).attr('checked', 1);
					}
				}
			}

			self.letterCellCoords = newLetterCell;
			self.SetCell(newLetterCell.x, newLetterCell.y, newLetterCell.letter);
			self.GetCell(newLetterCell.x, newLetterCell.y).addClass('letter_cell');
			self.AnimateCell(newLetterCell.x, newLetterCell.y);

			setTimeout(function()
			{
				for (var i = 0; i < wordCells.length; i++)
				{
					self.SelectCell(wordCells[i].x, wordCells[i].y);
				}
				self.AddWord(wordCells, word, false, function()
				{
					if (self.IsFieldFilled())
					{
						self.FinishGame();
					}
					else
					{
						self.SetLetterCellSelectionRound(true);
					}
				})
			}, 1500);
		}
		else
		{
			if (self.playerSkip)
			{
				self.FinishGame();
			}
			else
			{
				self.computerSkip = true;
				self.ShowPopup({
					html: 'Компьютер пропустил ход! Ваша очередь!',
					handler: function()
					{
						self.SetLetterCellSelectionRound(false);
					}
				});
			}
		}
	});
};

App.IsFieldFilled = function()
{
	return $('#field td[filled=0]').length == 0;
}

App.ShowButtons = function(skip, cancel)
{
	var buttonsWrap = $('#buttons_wrap');
	var skipButton = buttonsWrap.find('#skip');
	var cancelButton = buttonsWrap.find('#cancel');

	buttonsWrap.show();

	if (skip)
	{
		skipButton.show();
	}
	else
	{
		skipButton.hide();
	}

	if (cancel)
	{
		cancelButton.show();
	}
	else
	{
		cancelButton.hide();
	}
}

App.HideButtons = function()
{
	$('#buttons_wrap').hide();
}

App.SetLetterCellSelectionRound = function(applyLetter)
{
	this.ClearPlayerActions(applyLetter);
	this.ShowButtons(true, false);
	this.SetRound(this.Rounds.LETTER_CELL_SELECTION);
};

App.SetLetterSelectionRound = function(x, y)
{
	var letterCell;

	this.ClearPlayerActions(false);

	letterCell = this.GetCell(x, y);
	letterCell.addClass('letter_cell');

	this.letterCellCoords = { x: x, y: y };

	$('#letter_selection').show();
	this.ShowButtons(true, true);

	this.SetRound(this.Rounds.LETTER_SELECTION);
};

App.SetWordSelectionRound = function(letter)
{
	var letterCellCoords = this.letterCellCoords;

	this.SetCell(letterCellCoords.x, letterCellCoords.y, letter);
	this.RefreshWordAvailableCells();
	$('#letter_selection').hide();
	$('#word_selection').show();
	this.ShowButtons(true, true);

	this.SetRound(this.Rounds.WORD_SELECTION);
};

App.SetRound = function(round)
{
	var Rounds = this.Rounds;
	var hint;
	var fieldClass;
	var hintWrap = $('#hint');

	this.round = round;

	switch (round)
	{
		case Rounds.LETTER_CELL_SELECTION:
			hint = 'Выберите ячейку для новой буквы';
			fieldClass = 'letter_cell_selection';
			break;
		case Rounds.LETTER_SELECTION:
			hint = 'Выберите букву';
			fieldClass = 'letter_selection';
			break;
		case Rounds.WORD_SELECTION:
			hint = 'Выберите слово, нажимая на его буквы по очереди';
			fieldClass = 'word_selection';
			break;
		case Rounds.COMPUTER:
			hint = 'Подождите, пока компьютер сделает ход';
			fieldClass = 'computer';
			break;
	}

	$('#field')
		.removeClass('letter_cell_selection')
		.removeClass('letter_selection')
		.removeClass('word_selection')
		.removeClass('computer')
		.addClass(fieldClass);

	hintWrap.html(hint);
	//this.Animate(hintWrap);
};

App.FinishGame = function()
{
	this.ClearPlayerActions(true);

	$('#hint').html('Игра окончена');
	this.HideButtons();

	this.ShowPopup({
		html: this.GetScoreHtml(),
		title: 'Игра окончена',
		buttonCaption: 'Вернуться к полю',
		handler: function(){},
		otherButtons:
		[
			{
				caption: 'Начать заново',
				handler: function()
				{
					location.reload();
				}
			}
		]
	});
};

App.GetScoreHtml = function()
{
	var playerPoints = this.playerPoints;
	var computerPoints = this.computerPoints;

	return (playerPoints > computerPoints ? 'Вы выиграли' : 'Вы проиграли') +
		' со счётом ' + playerPoints + ':' + computerPoints + '!';
}
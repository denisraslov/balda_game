

var App = {};

//------------------------------ const --------------------------------------

App.Rounds =
{
	LETTER_CELL_SELECTION: 0,
	LETTER_SELECTION: 1,
	WORD_SELECTION: 2,
	COMPUTER: 3
};

App.Letters = ["а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л", "м",
	"н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я"];

//------------------------------- init -------------------------------------------

App.Init = function()
{
	this.ShowPopup({
		html: this.GetSettingsHtml(),
		title: 'Настройки игры',
		buttonCaption: 'Начать игру!',
		handler: function(popup)
		{
			var self = this;

			this.fieldSize = Number(popup.find('#field_size_select').val());
			this.complexity = Number(popup.find('#complexity_select').val());

			$('#new_game').show();
			$('#game_table_wrap').css('display', 'inline-block');
			$('#field').html(this.GetFieldHtml());
			$('#letter_selection').html(this.GetLetterSelectionHtml());

			this.BindHandlers();

			this.playerPoints = 0;
			this.computerPoints = 0;

			this.playerWords = [];
			this.computerWords = [];

			$('#hint').html('Загрузка...');
			this.SetFirstWord(function()
			{
				self.SetLetterCellSelectionRound();
			});
		}
	});
};

App.GetSettingsHtml = function()
{
	return '<div>' +
		'<div class="settings_item">' +
		'<div class="settings_item_title">Размер поля</div>' +
		'<select id="field_size_select">' +
			'<option value="5" selected>5</option>' +
			'<option value="6">6</option>' +
			'<option value="7">7</option>' +
		'</select></div><br>' +
		'<div class="settings_item">' +
		'<div class="settings_item_title">Сложность</div>' +
		'<select id="complexity_select">' +
			'<option value="0" selected>Низкая</option>' +
			'<option value="1">Высокая</option>' +
		'</select></div>' +
		'</div>';
};

App.SetFirstWord = function(callback)
{
	var self = this;

	this.GetFirstWord(function(word)
	{
		var y = Math.ceil(self.fieldSize / 2) - 1;

		self.firstWord = word;

		for (var x = 0; x < word.length; x++)
		{
			self.SetCell(x, y, word[x]);
		}

		callback();
	});
};

App.GetFirstWord = function(callback)
{
	this.Query('first_word', {}, callback);
};

App.GetFieldHtml = function()
{
	var fieldSize = this.fieldSize;
	var html = '';

	for (var y = 0; y < fieldSize; y++)
	{
		html += '<tr>';

		for (var x = 0; x < fieldSize; x++)
		{
			html += '<td x=' + x + ' y=' + y + ' filled=0></td>'
		}

		html += '</tr>';
	}

	return html;
};

App.GetLetterSelectionHtml = function()
{
	var letters = this.Letters;
	var html = '';

	for (var i = 0; i < letters.length; i++)
	{
		if (i == Math.round(letters.length / 2))
		{
			html += '<br>';
		}
		html += '<div class="letter_selection_item">' + letters[i] + '</div>'
	}

	return html;
};

App.RefreshWordAvailableCells = function()
{
	var lastSelectedCellCoords = this.selectedCellsCoords && this.selectedCellsCoords[this.selectedCellsCoords.length - 1];
	var fieldSize = this.fieldSize;
	var cell;

	for (var y = 0; y < fieldSize; y++)
	{
		for (var x = 0; x < fieldSize; x++)
		{
			cell = this.GetCell(x, y);

			if (this.IsFilledCell(x, y) && !this.IsSelectedCell(x, y) &&
				(!lastSelectedCellCoords || this.IsNearCells(lastSelectedCellCoords.x, lastSelectedCellCoords.y, x, y)))
			{
				cell.addClass('word_available_cell');
			}
			else
			{
				cell.removeClass('word_available_cell');
			}
		}
	}
};

App.RefreshLetterAvailableCells = function()
{
	var fieldSize = this.fieldSize;
	var cell;

	for (var y = 0; y < fieldSize; y++)
	{
		for (var x = 0; x < fieldSize; x++)
		{
			cell = this.GetCell(x, y);

			if (!this.IsFilledCell(x, y) &&
				(this.IsFilledCell(x - 1, y) ||
				this.IsFilledCell(x, y - 1) ||
				this.IsFilledCell(x + 1, y) ||
				this.IsFilledCell(x, y + 1)))
			{
				cell.addClass('letter_available_cell');
			}
			else
			{
				cell.removeClass('letter_available_cell');
			}
		}
	}
};

App.BindHandlers = function()
{
	var self = this;

	$('#field td').click(function(event)
	{
		var cell = $(event.target);
		var x;
		var y;

		x = Number(cell.attr('x'));
		y = Number(cell.attr('y'));

		if ((self.round == self.Rounds.LETTER_CELL_SELECTION ||
			self.round == self.Rounds.LETTER_SELECTION) && cell.hasClass('letter_available_cell'))
		{
			self.SetLetterSelectionRound(x, y);
		}

		if (self.round == self.Rounds.WORD_SELECTION)
		{
			if (cell.hasClass('word_available_cell'))
			{
				self.SelectCell(x, y);
			}
		}
	});

	$('.letter_selection_item').click(function(event)
	{
		self.SetWordSelectionRound(event.target.innerHTML);
	});

	$('#skip').click(function(event)
	{
		if (self.computerSkip)
		{
			self.FinishGame();
		}
		else
		{
			self.playerSkip = true;
			self.SetComputerRound();
		}
	});

	$('#cancel').click(function(event)
	{
		if (self.round == self.Rounds.LETTER_SELECTION)
		{
			self.SetLetterCellSelectionRound(false);
		}

		if (self.round == self.Rounds.WORD_SELECTION)
		{
			var letterCellCoords = self.letterCellCoords;

			self.SetLetterSelectionRound(letterCellCoords.x, letterCellCoords.y);
		}
	});

	$('#add_word').click(function(event)
	{
		self.CheckWord();
	});

	$('#clear_word').click(function(event)
	{
		self.ClearWord();
	});

	$('#new_game').click(function()
	{
		location.reload();
	});
};
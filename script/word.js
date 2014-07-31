
App.GetSelectedWord = function()
{
	return $('#selected_word')[0].innerHTML;
};

App.GetUsedWords = function()
{
	return this.playerWords.concat(this.computerWords).concat([this.firstWord]);
};

App.CheckWordUsing = function(word)
{
	return this.GetUsedWords().indexOf(word) == -1;
};

App.ClearWord = function()
{
	$('#field td[is_selected=1]').attr('is_selected', 0);
	delete this.selectedCellsCoords;
	this.RefreshWordAvailableCells();
	$('#selected_word').html('&nbsp;');
};

App.CheckWord = function()
{
	var self = this;
	var letterCellCoords = this.letterCellCoords;
	var selectedCellsCoords = this.selectedCellsCoords;
	var word;

	if (this.IsSelectedCell(letterCellCoords.x, letterCellCoords.y))
	{
		word = this.GetSelectedWord();

		if (this.CheckWordUsing(word))
		{
			$('#add_word').attr('disabled', 'disabled');
			this.Query('check_word', { word: word }, function(isValid)
			{
				if (isValid)
				{
					self.playerSkip = false;

					self.AddWord(selectedCellsCoords, word, true, function()
					{
						if (self.IsFieldFilled())
						{
							self.FinishGame();
						}
						else
						{
							$('#add_word').removeAttr('disabled');
							self.SetComputerRound();
						}
					});
				}
				else
				{
					self.ShowPopup({
						html: 'Введённое слово не найдено в словаре! Попробуйте заново!',
						handler: function()
						{
							$('#add_word').removeAttr('disabled');
							self.SetLetterCellSelectionRound(false);
						}
					})
				}
			});
		}
		else
		{
			self.ShowPopup({
				html: 'Введённое слово уже использовалось! Попробуйте заново!',
				handler: function()
				{
					self.SetLetterCellSelectionRound(false);
				}
			})
		}
	}
	else
	{
		self.ShowPopup({
			html: 'Слово должно содержать добавленную букву! Попробуйте заново!',
			handler: function()
			{
				self.SetLetterCellSelectionRound(false);
			}
		});
	}
};

App.AddWord = function(cellsCoords, word, isPlayer, callback)
{
	var self = this;
	var cellCoords;

	for (var i = 0; i < cellsCoords.length; i++)
	{
		cellCoords = cellsCoords[i];

		this.AnimateCell(cellCoords.x, cellCoords.y);
	}

	setTimeout(function()
	{
		var words = isPlayer ? self.playerWords : self.computerWords;
		var wordWrap;
		var wordsWrap = $('#' + (isPlayer ? 'player_words' : 'computer_words'));
		var points;

		if (isPlayer)
		{
			self.playerPoints += word.length;
			points = self.playerPoints;
		}
		else
		{
			self.computerPoints += word.length;
			points = self.computerPoints;
		}

		if (points != word.length)
		{
			wordsWrap.find('.added_word').last().append(', ');
		}

		wordWrap = $('<div class="added_word">' + word + '</div>');
		words.push(word);
		wordsWrap.append(wordWrap);

		wordsWrap.find('.score').html(points);
		self.Animate(wordsWrap.find('.score'), true);

		setTimeout(function()
		{
			callback()
		}, 1500);
	}, 1500);
};

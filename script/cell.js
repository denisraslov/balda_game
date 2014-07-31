
App.SetCell = function(x, y, letter)
{
	var cell = this.GetCell(x, y);

	if (letter)
	{
		cell.html(letter);
		cell.attr('filled', 1);
	}
	else
	{
		cell.html('');
		cell.attr('filled', 0);
	}
};

App.GetCell = function(x, y)
{
	return $('#field tr').eq(y).find('td').eq(x);
};

App.GetCellLetter = function(x, y)
{
	return this.GetCell(x, y).html();
};

App.Animate = function(element, isFast)
{
	var speed = isFast ? 'fast' : 'slow';

	element.fadeTo(speed, 0.1).fadeTo('slow', 1);
};

App.AnimateCell = function(x, y)
{
	this.Animate(this.GetCell(x, y));
};

App.IsFilledCell = function(x, y)
{
	var fieldSize = this.fieldSize;

	if (x < 0 || x > fieldSize - 1 || y < 0 || y > fieldSize - 1)
	{
		return false;
	}

	return Number(this.GetCell(x, y).attr('filled'));
};

App.IsNearCells = function(x1, y1, x2, y2)
{
	return (x1 == x2 && y1 == y2 + 1) ||
		(x1 == x2 && y1 == y2 - 1) ||
		(x1 == x2 + 1 && y1 == y2) ||
		(x1 == x2 - 1 && y1 == y2);
};

App.IsSelectedCell = function(x, y)
{
	return Number(this.GetCell(x, y).attr('is_selected'));
};

App.SelectCell = function(x, y)
{
	var cell = this.GetCell(x, y);
	var selectedWordWrap = $('#selected_word')[0];

	cell.attr('is_selected', 1);
	if (!this.selectedCellsCoords)
	{
		selectedWordWrap.innerHTML = '';
	}
	selectedWordWrap.innerHTML += cell.html();

	this.selectedCellsCoords = this.selectedCellsCoords || [];
	this.selectedCellsCoords.push({ x: x, y: y });

	this.RefreshWordAvailableCells();
};
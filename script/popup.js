
App.ShowPopup = function(params)
{
	var self = this;
	var otherButtons = params.otherButtons || [];
	var otherButtonsHtml = '';

	for (var i = 0; i < otherButtons.length; i++)
	{
		otherButtonsHtml += '<button id="popup_other_button_' + i + '">' + otherButtons[i].caption + '</button>';
	}

	$('body').append('<div id="popup_layout"></div>' +
		'<div id="popup">' +
		'<div id="popup_title">' + (params.title || 'Оповещение') + '</div>' +
		'<div id="popup_content">' + params.html + '</div>' +
		'<div id="popup_buttons"><button id="popup_ok">' + (params.buttonCaption || 'Ясно') +'</button>' +
		otherButtonsHtml + '</div>' +
		'</div>');

	$('#popup_ok').click(function(event)
	{
		var popup = $('#popup').detach();

		$('#popup_layout').remove();

		params.handler.call(self, popup);

		popup.remove();
	});

	for (var i = 0; i < otherButtons.length; i++)
	{
		(function(i)
		{
			$('#popup_other_button_' + i).click(function()
			{
				otherButtons[i].handler.call(self);
			});
		})(i);
	}
};
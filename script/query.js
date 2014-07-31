
App.Query = function(action, params, callback)
{
	var self = this;

	params.size = this.fieldSize;
	params.complexity = this.complexity;

	$.ajax({
		url: 'php/gate.php',
		type: 'GET',
		dataType: 'json',
		data:
		{
			action: action,
			params: JSON.stringify(params)
		}
	})
	.done(function(response)
	{
		if (response.result)
		{
			callback(response.data);
		}
		else
		{
			self.ShowPopup({
				html: 'Ошибка запроса: ' + response.data,
				buttonCaption: 'Повторить запрос',
				handler: function()
				{
					self.Query(action, params, callback);
				}
			});
		}
	})
	.fail(function()
	{
		self.ShowPopup({
			html: 'Сервер недоступен',
			buttonCaption: 'Повторить запрос',
			handler: function()
			{
				self.Query(action, params, callback);
			}
		});
	})
};
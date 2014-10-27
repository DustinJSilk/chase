define(["backbone"], function (Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		idAttribute: "_id",

		defaults: {
			chaseId: 			null,
			customTitle: 		"",
			colour: 			null,
			isHidden: 			false,
			isAnonymous: 		false,
			isTiming: 			false,
			timingStamp: 		0,
			todaysTime:  		0,
			todaysDay: 			0,
			record: 			[]
		}
	})

	return TimesheetModel;
})
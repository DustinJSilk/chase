define(["backbone"], function (Backbone) {

	var TimesheetModel = Backbone.Model.extend({
		
		defaults: {
			id: 				null,
			chaseId: 			null,
			customTitle: 		"",
			colour: 			null,
			isHidden: 			false,
			isAnonymous: 		false,
			isTiming: 			false,
			timingStamp: 		0,
			unaddedTime:  		0,
			unaddedTimeDate: 	0,
			record: 			[]
		}
	})

	return TimesheetModel;
})
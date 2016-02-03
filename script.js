// This function is called when Office.js is ready to start your Add-in
Office.initialize = function (reason) { 
	$(document).ready(function () {
		displayItemDetails();
	});
}; 

// Displays the "Subject" and "From" fields, based on the current mail item
function displayItemDetails() {
	var item = Office.cast.item.toItemRead(Office.context.mailbox.item);
	$('#subject').text(item.subject);

	var from;
	if (item.itemType === Office.MailboxEnums.ItemType.Message) {
		from = Office.cast.item.toMessageRead(item).from;
	} else if (item.itemType === Office.MailboxEnums.ItemType.Appointment) {
		from = Office.cast.item.toAppointmentRead(item).organizer;
	}

	if (from) {
		$('#from').text(from.displayName);
	}
}
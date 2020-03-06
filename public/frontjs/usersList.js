const addFriendButtons = document.querySelectorAll('.addFriendButton');

addFriendButtons.forEach((button) => {
	button.addEventListener('click', function(event) {
		console.log(event.target);
		console.dir(event.target);
	});
});

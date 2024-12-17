const { REST, Routes } = require('discord.js');
require('dotenv/config');


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
	try {

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: [] },
		);

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: [] },
		);

	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

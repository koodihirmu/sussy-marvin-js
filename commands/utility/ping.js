const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require('discord.js')

//.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('replies with pong!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
	global: true
};

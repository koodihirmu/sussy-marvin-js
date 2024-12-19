const { SlashCommandBuilder, MessageFlags, MessagePayload } = require("discord.js");
const { PermissionFlagsBits } = require('discord.js')

module.exports = {
	// creating the slash command
	data: new SlashCommandBuilder()
		.setName('latex')
		.setDescription('generate latex code from input.')
		.addStringOption(option => {
			option.setName('input')
				.description('input for latex generation.')
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
	// function to execute the interaction
	async execute(interaction) {
		const input = interaction.options.getString('input') ?? 'no input provided';

		await interaction.reply({ content: `latex input ${input}`, flags: MessageFlags.Ephemeral });
	},
	global: true // not used
};

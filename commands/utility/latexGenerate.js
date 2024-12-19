const { SlashCommandBuilder, MessageFlags, MessagePayload } = require("discord.js");
const { PermissionFlagsBits } = require('discord.js')
const fs = require('node:fs');
const path = require('node:path');
const latex = require('node-latex')
const pdftopic = require('pdftopic')

const latexGenerateDocument = async (input) => {
	return `
	\\documentclass[border=5pt]{standalone} 
	\\usepackage{amsmath} 
	\\pagenumbering{gobble}
	\\begin{document} 
	\\begin{math}
	\\displaystyle
	${input}
	\\end{math}
	\\end{document} % This is the end of the document
	`;
}


module.exports = {
	// creating the slash command
	data: new SlashCommandBuilder()
		.setName('latex')
		.setDescription('generate latex code from input.')
		.addStringOption(option =>
			option
				.setName('input')
				.setDescription('input for latex generation.')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel),
	// function to execute the interaction
	async execute(interaction) {
		// prefix for outputfiles
		const outputName = `${interaction.user.id}-output`;
		// user input
		const input = interaction.options.getString('input') ?? undefined;
		if (!input) {
			interaction.reply({ content: "no input provided", flags: MessageFlags.Ephemeral })
			return;
		}

		try {
			fs.writeFile(`latex-templates/${interaction.user.id}.tex`, await latexGenerateDocument(input), err => {
				if (err) {
					console.error(err)
				}
			});

			const latex_input = fs.createReadStream(`latex-templates/${interaction.user.id}.tex`)
			const output = fs.createWriteStream(`tmp/${outputName}.pdf`)
			const pdf = latex(latex_input)

			// write latex to pdf
			await pdf.pipe(output)

			await pdf.on('error', err => interaction.reply({ content: "was not able to generate latex for your input.", flags: MessageFlags.Ephemeral }));
			await pdf.on('finish', async () => {
				// create png from pdf
				const pdfIn = fs.readFileSync(`tmp/${outputName}.pdf`)
				const convertedResult = await pdftopic.pdftobuffer(pdfIn, 0);
				fs.writeFileSync(`tmp/${outputName}.png`, convertedResult[0]);
				await interaction.reply({ files: [{ attachment: `tmp/${outputName}.png` }] })
			});

		} catch (error) {
			console.error(error)
			interaction.reply({ content: "was not able to generate latex for your input.", flags: MessageFlags.Ephemeral })
		}
	},
	global: true // not used
};

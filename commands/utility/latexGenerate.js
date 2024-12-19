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
	${input} 
	\\end{math}
	\\end{document} % This is the end of the document
	`;
}

const createPdf = async () => {
	const pdfIn = fs.readFileSync('tmp/output.pdf')
	const convertedResult = await pdftopic.pdftobuffer(pdfIn, 0);
	fs.writeFileSync('tmp/output.png', convertedResult[0]);
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
		const input = interaction.options.getString('input') ?? undefined;
		if (!input) {
			interaction.reply({ content: "no input provided", flags: MessageFlags.Ephemeral })
			return;
		}

		fs.writeFile('latex-templates/input.tex', await latexGenerateDocument(input), err => {
			if (err) {
				console.error(err)
			}
		});

		const latex_input = fs.createReadStream('latex-templates/input.tex')
		const output = fs.createWriteStream('tmp/output.pdf')
		const pdf = latex(latex_input)

		//await interaction.reply({ content: `latex input ${input}`, flags: MessageFlags.Ephemeral });
		await pdf.pipe(output)


		pdf.on('error', err => interaction.reply({ content: "was not able to generate latex for your input.", flags: MessageFlags.Ephemeral }));
		pdf.on('finish', async () => {
			await createPdf()
			await interaction.reply({ files: [{ attachment: 'tmp/output.png' }] })
		});
	},
	global: true // not used
};

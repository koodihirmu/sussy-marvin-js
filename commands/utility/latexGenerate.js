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
		const tmp_path = "./tmp/"
		const latexTemplatePath = "./latex-templates/"
		const outputName = `${interaction.user.id}-output`;

		// create directories for tmp and latex templates
		fs.mkdir(tmp_path, { recursive: true }, (err) => {
			if (err) { throw (err) }
		})

		fs.mkdir(latexTemplatePath, { recursive: true }, (err) => {
			if (err) { throw (err) }
		})

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
			const output = fs.createWriteStream(`${tmp_path}${outputName}.pdf`)
			const pdf = latex(latex_input)
			console.log("pdf from latex input")

			// write latex to pdf
			await pdf.pipe(output)
			console.log("piped the pdf to output")

			await pdf.on('error', err => interaction.reply({ content: err.message, flags: MessageFlags.Ephemeral }));
			await pdf.on('finish', async () => {
				try {
					// create png from pdf
					const pdfIn = fs.readFileSync(`${tmp_path}${outputName}.pdf`)
					console.log("reading in pdf")
					const convertedResult = await pdftopic.pdftobuffer(pdfIn, 0);
					console.log("converting with pdftopic")
					fs.writeFileSync(`${tmp_path}${outputName}.png`, convertedResult[0]);
					console.log("writing")
					await interaction.reply({ files: [{ attachment: `${tmp_path}${outputName}.png` }] })
					// close streams
					latex_input.close()
					output.close()
				}
				catch (error) {
					console.log(error.message)
					latex_input.close()
					output.close()
				}
			});

		} catch (error) {
			console.error(error)
			interaction.reply({ content: `${error}`, flags: MessageFlags.Ephemeral })
		}
	},
	global: true // not used
};

import {
	Client
} from 'discord.js-selfbot-v13';
import readline from 'readline';
import chalk from 'chalk';

const client = new Client();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const askQuestion = (query) => {
	return new Promise(resolve => rl.question(query, resolve));
};

const deleteMessages = async (channelIDs, delay) => {
	console.log(chalk.blue(`Checking channels for messages every ${delay / 1000} seconds...`));

	setInterval(async () => {
		const now = Date.now();
		const cutoffTime = now - delay; 

		for (const channelID of channelIDs) {
			const channel = await client.channels.fetch(channelID).catch(err => {
				console.error(chalk.red(`Failed to fetch channel ${channelID}: ${err.message}`));
			});

			if (!channel) continue;

			const messages = await channel.messages.fetch({
				limit: 100
			}).catch(err => {
				console.error(chalk.red(`Failed to fetch messages in channel ${channelID}: ${err.message}`));
			});

			if (!messages) continue;

			const myMessages = messages.filter(msg => 
				msg.author.id === client.user.id && 
				msg.createdTimestamp < cutoffTime 
			);

			myMessages.forEach((message, index) => {
				setTimeout(async () => {
					await message.delete().catch(err => {
						console.error(chalk.red(`Failed to delete message ${message.id}: ${err.message}`));
					});
					console.log(chalk.green(`Deleted message ${message.id} from channel ${channelID}`));
				}, 3500 * index);
			});
		}
	}, delay);
};

async function main() {
	const token = await askQuestion(chalk.yellow('Enter your token: '));
	const channelsInput = await askQuestion(chalk.yellow('Enter the channel IDs to watch (comma-separated): '));
	const delayInput = await askQuestion(chalk.yellow('Enter the delay (in milliseconds): '));

	const channelIDs = channelsInput.split(',').map(id => id.trim());
	const delay = parseInt(delayInput);

	client.on('ready', async () => {
		console.log(chalk.green(`${client.user.username} is ready and running!`));
		deleteMessages(channelIDs, delay);
	});

	client.login(token).catch(err => {
		console.error(chalk.red(`Failed to login: ${err.message}`));
	});
}

main().then(() => {
	rl.close();
});

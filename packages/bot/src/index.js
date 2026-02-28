import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import { MAX_OFFENSES, WARNING_MESSAGES } from './constants.js';
import { incrementOffenseCount, resetAllOffenses } from './db.js';
import { startDashboard } from '../../dashboard/src/server.js';

startDashboard();

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;
const WATCHED_USER_ID = process.env.WATCHED_USER_ID;
const PROTECTED_USER_ID = process.env.PROTECTED_USER_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const PORT = process.env.PORT || 3000;

if (!TOKEN || !WATCHED_USER_ID || !PROTECTED_USER_ID) {
    console.error('Missing required environment variables (DISCORD_TOKEN, WATCHED_USER_ID, PROTECTED_USER_ID)');
    process.exit(1);
}

// Ensure the bot can read messages
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Setup express app for keep-alive requests (e.g. from UptimeRobot on Replit)
const app = express();
app.get('/', (req, res) => {
    res.send('Discord bot is alive and running!');
});
app.listen(PORT, () => {
    console.log(`Keep-alive server listening on port ${PORT}`);
});

// Schedule daily reset of warnings (runs at midnight server time)
cron.schedule('0 0 * * *', () => {
    console.log('Running daily offense reset cron job...');
    const resetCount = resetAllOffenses();
    console.log(`Reset offenses for ${resetCount} users.`);

    if (LOG_CHANNEL_ID) {
        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send(`Daily offense reset completed. Reset ${resetCount} users.`);
        }
    }
});

// Bot standard event handlers
client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

/**
 * Handle incoming messages.
 */
client.on('messageCreate', async (message) => {
    // Ignore messages from the bot itself or other bots
    if (message.author.bot) return;

    // Check if the author is the watched user
    if (message.author.id !== WATCHED_USER_ID) return;

    // Check if the message mentions the protected user
    const mentionsProtectedUser = message.mentions.users.has(PROTECTED_USER_ID);

    if (mentionsProtectedUser) {
        const guild = message.guild;
        const author = message.author;
        const member = message.member;

        try {
            // Increment and get new count
            const offenseCount = incrementOffenseCount(author.id);
            console.log(`User ${author.tag} mentioned protected user. Offense count: ${offenseCount}`);

            let warningText = WARNING_MESSAGES[Math.min(offenseCount, MAX_OFFENSES)];

            // Construct a response message depending on the offense count
            if (offenseCount < MAX_OFFENSES) {
                // Send a warning in the channel and try DM
                await message.reply(warningText);
                try {
                    await author.send(`**Warning from ${guild.name}**: ${warningText}`);
                } catch (dmError) {
                    console.error(`Could not send DM to ${author.tag}`);
                }
            } else {
                // Third offense: ban the user
                await message.reply(warningText);

                try {
                    await author.send(`**Banned from ${guild.name}**: ${warningText}`);
                } catch (dmError) {
                    console.log(`Could not send ban DM to ${author.tag}`);
                }

                if (member) {
                    if (member.bannable) {
                        await member.ban({ reason: 'Repeatedly pinged the protected user after warnings.' });
                        console.log(`Banned ${author.tag} successfully.`);
                    } else {
                        console.log(`Failed to ban ${author.tag}. Bot does not have required permissions.`);
                        await message.channel.send(`Failed to ban <@${author.id}>. Please check my role permissions.`);
                    }
                }
            }

            // Log the offense to the designated log channel
            if (LOG_CHANNEL_ID) {
                const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
                if (logChannel && logChannel.isTextBased()) {
                    const actionText = offenseCount >= MAX_OFFENSES ? '**BANNED**' : `**WARNING ${offenseCount}/${MAX_OFFENSES}**`;
                    await logChannel.send(
                        `[LOG] <@${author.id}> pinged the protected user. Action taken: ${actionText}`
                    );
                }
            }
        } catch (error) {
            console.error('Error handling message for watched user:', error);
        }
    }
});

// Login
client.login(TOKEN);

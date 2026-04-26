package com.example.chatgame;

import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.message.v1.ClientReceiveMessageEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.mojang.brigadier.arguments.IntegerArgumentType;

import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.argument;
import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.literal;

public class ChatGameClient implements ClientModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("chatgame");
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final Random random = new Random();

    private boolean enabled = true;
    private int minDelay = 5;
    private int maxDelay = 10;

    @Override
    public void onInitializeClient() {
        LOGGER.info("Chat Game Solver initialized!");

        // Register Chat Listeners (Both CHAT and GAME/System messages)
        ClientReceiveMessageEvents.CHAT.register((message, signedMessage, sender, params, receptionTimestamp) -> {
            if (enabled) processChatMessage(message.getString());
        });

        ClientReceiveMessageEvents.GAME.register((message, overlay) -> {
            if (enabled) processChatMessage(message.getString());
        });

        // Register Commands
        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> {
            dispatcher.register(literal("chatgame")
                .then(literal("toggle").executes(context -> {
                    enabled = !enabled;
                    context.getSource().sendFeedback(Text.literal("§7[ChatGame] §fStatus: " + (enabled ? "§aEnabled" : "§cDisabled")));
                    return 1;
                }))
                .then(literal("delay")
                    .then(argument("min", IntegerArgumentType.integer(0, 60))
                        .then(argument("max", IntegerArgumentType.integer(0, 60))
                            .executes(context -> {
                                int min = IntegerArgumentType.getInteger(context, "min");
                                int max = IntegerArgumentType.getInteger(context, "max");
                                if (min > max) {
                                    context.getSource().sendFeedback(Text.literal("§7[ChatGame] §cMin delay cannot be greater than max delay!"));
                                    return 0;
                                }
                                minDelay = min;
                                maxDelay = max;
                                context.getSource().sendFeedback(Text.literal("§7[ChatGame] §fDelay set to §b" + min + "§f-§b" + max + "§fs"));
                                return 1;
                            }))))
                .then(literal("status").executes(context -> {
                    context.getSource().sendFeedback(Text.literal("§7[ChatGame] §fStatus: " + (enabled ? "§aEnabled" : "§cDisabled") + " §7| Delay: §b" + minDelay + "-" + maxDelay + "s"));
                    return 1;
                }))
            );
        });
    }

    private void processChatMessage(String content) {
        // Remove formatting codes for cleaner matching
        String cleanContent = content.replaceAll("§[0-9a-fklmnor]", "");

        // 1. Math Games
        String mathAnswer = solveMath(cleanContent);
        if (mathAnswer != null) {
            scheduleResponse(mathAnswer);
            return;
        }

        // 2. Fast Type Games (Codes/Words)
        String fastTypeAnswer = solveFastType(cleanContent);
        if (fastTypeAnswer != null) {
            scheduleResponse(fastTypeAnswer);
            return;
        }

        // 3. Unscramble (Common simple format)
        String unscrambleAnswer = solveUnscramble(cleanContent);
        if (unscrambleAnswer != null) {
            scheduleResponse(unscrambleAnswer);
            return;
        }
    }

    private String solveMath(String content) {
        // Supports: "5 + 10", "15 - 3", "4 * 2", "10 / 2", "5x5"
        Pattern pattern = Pattern.compile("(\\d+)\\s*([+\\-*/x])\\s*(\\d+)");
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            try {
                long num1 = Long.parseLong(matcher.group(1));
                String operator = matcher.group(2).toLowerCase();
                long num2 = Long.parseLong(matcher.group(3));

                long result = 0;
                switch (operator) {
                    case "+": result = num1 + num2; break;
                    case "-": result = num1 - num2; break;
                    case "*":
                    case "x": result = num1 * num2; break;
                    case "/": if (num2 != 0) result = num1 / num2; break;
                    default: return null;
                }
                return String.valueOf(result);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private String solveFastType(String content) {
        // Matches: "Type: ABCD", "Code: 1234", "Fast: XYZ"
        Pattern pattern = Pattern.compile("(?:type|code|fast|repeat)\\s*[:\\-]?\\s*([A-Z0-9]{4,12})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private static final List<String> DICTIONARY = Arrays.asList(
        "MINECRAFT", "DIAMOND", "PICKAXE", "SURVIVAL", "FACTIONS", "SKYBLOCK",
        "EMERALD", "OBSIDIAN", "BEDROCK", "CREEPER", "ZOMBIE", "SKELETON",
        "ENDERMAN", "VILLAGER", "MOJANG", "CRAFTING", "FURNACE", "INVENTORY",
        "APPLE", "BANANA", "ORANGE", "CHICKEN", "SPIDER", "NETHER",
        "END", "PORTAL", "BLOCK", "SWORD", "ARMOR", "HELMET", "CHESTPLATE",
        "COBBLESTONE", "IRON", "GOLD", "LAPIS", "REDSTONE", "QUARTZ", "NETHERITE",
        "STEAK", "PORKCHOP", "MUTTON", "RABBIT", "BREAD", "COOKIE", "CAKE",
        "PUMPKIN", "MELON", "WHEAT", "CARROT", "POTATO", "BEETROOT", "SUGARCANE"
    );

    private String solveUnscramble(String content) {
        Pattern pattern = Pattern.compile("unscramble\\s*[:\\-]?\\s*([A-Z]{3,12})", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            String scrambled = matcher.group(1).toUpperCase();
            for (String word : DICTIONARY) {
                if (isAnagram(scrambled, word)) {
                    return word;
                }
            }
        }
        return null;
    }

    private boolean isAnagram(String s1, String s2) {
        if (s1.length() != s2.length()) return false;
        char[] chars1 = s1.toCharArray();
        char[] chars2 = s2.toCharArray();
        Arrays.sort(chars1);
        Arrays.sort(chars2);
        return Arrays.equals(chars1, chars2);
    }

    private void scheduleResponse(String answer) {
        int delay = minDelay + random.nextInt(maxDelay - minDelay + 1);
        LOGGER.info("ChatGame: Answer '{}' will be sent in {}s", answer, delay);

        scheduler.schedule(() -> {
            MinecraftClient client = MinecraftClient.getInstance();
            if (client.player != null && client.getNetworkHandler() != null) {
                // Use the correct method for 1.21.1
                client.execute(() -> {
                    if (client.player != null) {
                        client.player.networkHandler.sendChatMessage(answer);
                    }
                });
            }
        }, delay, TimeUnit.SECONDS);
    }
}

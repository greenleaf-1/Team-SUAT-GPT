package suatgpt.backend.bot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.DefaultBotOptions;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class SuatBot extends TelegramLongPollingBot {

    private final String botUsername;
    private final String botToken;

    // ✅ 核心修改：通过构造函数注入所有配置，并在 super() 之前设置代理
    public SuatBot(
            @Value("${telegram.bot.username}") String botUsername,
            @Value("${telegram.bot.token}") String botToken,
            @Value("${proxy.host:127.0.0.1}") String proxyHost,
            @Value("${proxy.port:7890}") int proxyPort
    ) {
        // 调用父类构造函数，传入带有代理的 Options
        super(createProxyOptions(proxyHost, proxyPort));

        this.botUsername = botUsername;
        this.botToken = botToken;

        System.out.println("🤖 [SuatBot] 机器人已就绪，代理: " + proxyHost + ":" + proxyPort);
    }

    // 静态辅助方法：创建带有代理的配置对象
    private static DefaultBotOptions createProxyOptions(String host, int port) {
        DefaultBotOptions options = new DefaultBotOptions();
        options.setProxyHost(host);
        options.setProxyPort(port);
        options.setProxyType(DefaultBotOptions.ProxyType.HTTP);
        return options;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            long chatId = update.getMessage().getChatId();
            String text = update.getMessage().getText();

            // 简单的回显逻辑
            if (text.startsWith("评估")) {
                sendSimpleMessage(chatId, "🔍 David，我已收到请求。正在通过配置的 AI 引擎为您评估选题...");
            }
        }
    }

    private void sendSimpleMessage(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText(text);
        try {
            execute(message);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }
}
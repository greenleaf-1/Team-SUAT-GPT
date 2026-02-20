//package suatgpt.backend.config;
//
//import suatgpt.backend.bot.SuatBot;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.telegram.telegrambots.bots.DefaultBotOptions;
//import org.telegram.telegrambots.meta.TelegramBotsApi;
//import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;
//
//@Configuration
//public class TelegramConfig {
//
//    @Bean
//    public TelegramBotsApi telegramBotsApi(SuatBot suatBot) throws Exception {
//        // 1. 创建 API 对象
//        TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);
//
//        // 2. 注册机器人
//        // 注意：SuatBot 内部也需要同步配置 options，否则依然会连接超时
//        api.registerBot(suatBot);
//
//        System.out.println("✅ [Telegram] 代理配置已生效，机器人上线成功！");
//        return api;
//    }
//}
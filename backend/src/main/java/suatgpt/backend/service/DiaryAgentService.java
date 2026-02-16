
package suatgpt.backend.service;

import org.springframework.stereotype.Service;
import suatgpt.backend.model.User;
import suatgpt.backend.repository.ChatMessageRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
public class DiaryAgentService {

    private final ChatMessageRepository chatMessageRepository;
    private static final String DIARY_DIR = "./my_diaries/";

    public DiaryAgentService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public String getTodayContext(User user) {
        // 使用修正后的 Repository 方法
        return chatMessageRepository.findBySessionUserOrderByTimestampAsc(user).stream()
                .filter(msg -> msg.getTimestamp().toLocalDate().isEqual(LocalDate.now()))
                .map(msg -> msg.getSender() + ": " + msg.getContent())
                .collect(Collectors.joining("\n"));
    }

    public String saveDiaryToDisk(String diaryContent) throws IOException {
        Path dirPath = Paths.get(DIARY_DIR);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String fileName = "diary_" + LocalDate.now() + ".md";
        Path filePath = dirPath.resolve(fileName);

        Files.writeString(filePath, diaryContent);
        return filePath.toAbsolutePath().toString();
    }
}

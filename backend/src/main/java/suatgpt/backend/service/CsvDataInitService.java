package suatgpt.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import suatgpt.backend.model.MentorMapping;
import suatgpt.backend.repository.MentorMappingRepository;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvDataInitService {

    private final MentorMappingRepository repository;

    public CsvDataInitService(MentorMappingRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void initDatabase() {
        try {
            // 🚀 物理清理：如果之前存了乱码，请先手动清空表或取消下面注释
            // repository.deleteAll();

            if (repository.count() > 0) return;

            List<String[]> data = new ArrayList<>();
            // 🚀 载荷对齐：学号, 姓名, 导师, 学院
            data.add(new String[]{"SUAT24000101", "黄绍恒", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000102", "阮家轩", "周涛", "生命健康学院"});
            data.add(new String[]{"SUAT24000103", "丘林沨", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000104", "刘骏熹", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000105", "李岸鸿", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000106", "吴颖达", "李慧云", "算力微电子学院"});
            data.add(new String[]{"SUAT24000107", "方子涵", "连祺周", "合成生物学院"});
            data.add(new String[]{"SUAT24000108", "蔡沅", "连祺周", "合成生物学院"});
            data.add(new String[]{"SUAT24000109", "严皓", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000110", "罗涵", "胡强", "合成生物学院"});
            data.add(new String[]{"SUAT24000111", "江雨馨", "张先恩", "合成生物学院"});
            data.add(new String[]{"SUAT24000112", "任可滢", "潘毅", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000113", "黄健翔", "马智恒", "算力微电子学院"});
            data.add(new String[]{"SUAT24000114", "曾梓轩", "刘重持", "合成生物学院"});
            data.add(new String[]{"SUAT24000115", "谭佳湲", "马智恒", "算力微电子学院"});
            data.add(new String[]{"SUAT24000116", "姚耀", "马智恒", "算力微电子学院"});
            data.add(new String[]{"SUAT24000117", "毛奕涵", "周鹏程", "生命健康学院"});
            data.add(new String[]{"SUAT24000118", "崔澜馨", "张先恩", "合成生物学院"});
            data.add(new String[]{"SUAT24000119", "胡子豪", "潘璠", "药学院"});
            data.add(new String[]{"SUAT24000120", "邱宇承", "邢佑路", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000121", "李禹剑", "叶克强", "生命健康学院"});
            data.add(new String[]{"SUAT24000122", "陈思睿", "王大伟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000123", "王照暄", "韩明虎", "生命健康学院"});
            data.add(new String[]{"SUAT24000124", "古倬立", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000125", "曾灏乾", "陈有海", "药学院"});
            data.add(new String[]{"SUAT24000126", "刘予墨", "陈有海", "药学院"});
            data.add(new String[]{"SUAT24000127", "唐昕玥", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000128", "赖子皓", "董超", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000129", "王子腾", "姜璟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000130", "文舒乐", "王大伟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000131", "傅仕豪", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000132", "郑泽昆", "潘璠", "药学院"});
            data.add(new String[]{"SUAT24000133", "孙伟雄", "董超", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000134", "肖思恬", "董超", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000135", "詹家瑞", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000136", "王子轩", "李雅樵", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000137", "李之城", "潘毅", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000138", "彭宇轩", "邵翠萍", "算力微电子学院"});
            data.add(new String[]{"SUAT24000139", "雷嘉莉", "Rainer Hedrich", "合成生物学院"});
            data.add(new String[]{"SUAT24000140", "徐晨溪", "陈奕含", "算力微电子学院"});
            data.add(new String[]{"SUAT24000141", "李逸为", "彭辉", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000142", "杨曦哲", "殷勤", "药学院"});
            data.add(new String[]{"SUAT24000143", "陈清源", "王玉田", "生命健康学院"});
            data.add(new String[]{"SUAT24000144", "吕昊宸", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000145", "唐宇轩", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000146", "李泓浩", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000147", "吴汶儒", "傅为农", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000148", "蔡成易", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000149", "张佳敏", "杨敏", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000150", "马培澄", "李金艳", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000151", "刘基灿", "周鹏程", "生命健康学院"});
            data.add(new String[]{"SUAT24000152", "庄琼淇", "杨智荣", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000153", "郑欣铨", "殷勤", "药学院"});
            data.add(new String[]{"SUAT24000154", "吴承翰", "徐家科", "药学院"});
            data.add(new String[]{"SUAT24000155", "郑烁曈", "连祺周", "合成生物学院"});
            data.add(new String[]{"SUAT24000156", "钟承翰", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000157", "沈伟键", "傅为农", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000158", "朱祺帆", "邵翠萍", "算力微电子学院"});
            data.add(new String[]{"SUAT24000159", "梁进杰", "邢佑路", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000160", "梁梓聪", "王枫", "生命健康学院"});
            data.add(new String[]{"SUAT24000161", "程嘉锐", "黄廷文", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000162", "肖逸朗", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000163", "沙子丞", "董超", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000164", "刘耀昊", "李慧云", "算力微电子学院"});
            data.add(new String[]{"SUAT24000165", "蒋弘毅", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000166", "严振铭", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000167", "陈浩文", "姜璟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000168", "邓擎天", "潘毅", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000169", "谢美怡", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000170", "林煜杰", "杨贞标", "合成生物学院"});
            data.add(new String[]{"SUAT24000171", "梁海源", "白杨", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000172", "曹浩", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000173", "梁钧雄", "孙坚原", "生命健康学院"});
            data.add(new String[]{"SUAT24000174", "熊晨曦", "周航", "生命健康学院"});
            data.add(new String[]{"SUAT24000175", "洪宇聪", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000176", "吴炎桥", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000177", "赵子昊", "刘鑫", "药学院"});
            data.add(new String[]{"SUAT24000178", "杨晓东", "王松", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000179", "邱子烨", "傅为农", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000180", "杨华昕", "马智恒", "算力微电子学院"});
            data.add(new String[]{"SUAT24000181", "张恒", "黄廷文", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000182", "蔡相宜", "韩明虎", "生命健康学院"});
            data.add(new String[]{"SUAT24000183", "王律以", "唐志敏", "算力微电子学院"});
            data.add(new String[]{"SUAT24000184", "曾仕欢", "陈有海", "药学院"});
            data.add(new String[]{"SUAT24000185", "吴梓鹏", "傅为农", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000186", "梁森茂", "李慧云", "算力微电子学院"});
            data.add(new String[]{"SUAT24000187", "唐鹏飞", "李金艳", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000188", "植睿淇", "殷勤", "药学院"});
            data.add(new String[]{"SUAT24000189", "梁天逸", "黄廷文", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000190", "申婧", "赵勇", "合成生物学院"});
            data.add(new String[]{"SUAT24000191", "叶顾霖", "胡强", "合成生物学院"});
            data.add(new String[]{"SUAT24000192", "李卓汇", "李慧云", "算力微电子学院"});
            data.add(new String[]{"SUAT24000193", "叶涛源", "唐继军", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000194", "孙浩杰", "李朝", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000195", "卢敏虹", "潘璠", "药学院"});
            data.add(new String[]{"SUAT24000196", "张子菡", "刘鑫", "药学院"});
            data.add(new String[]{"SUAT24000197", "袁鸣谦", "王大伟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000198", "郭杰仁", "陈有海", "药学院"});
            data.add(new String[]{"SUAT24000199", "黄志棚", "刘重持", "合成生物学院"});
            data.add(new String[]{"SUAT24000200", "贺羽婕", "张先恩", "合成生物学院"});
            data.add(new String[]{"SUAT24000201", "张驰", "孔艺", "药学院"});
            data.add(new String[]{"SUAT24000202", "周涵毅", "连祺周", "合成生物学院"});
            data.add(new String[]{"SUAT24000203", "蒋金", "胡强", "合成生物学院"});
            data.add(new String[]{"SUAT24000204", "关标著", "张先恩", "合成生物学院"});
            data.add(new String[]{"SUAT24000205", "陈昊", "周涛", "生命健康学院"});
            data.add(new String[]{"SUAT24000206", "郑嘉颖", "黄廷文", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000207", "黄韬", "周鹏程", "生命健康学院"});
            data.add(new String[]{"SUAT24000208", "刘家宝", "王大伟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000209", "罗文琦", "Helmut Otto Kettenmann", "生命健康学院"});
            data.add(new String[]{"SUAT24000210", "张智燊", "张先恩", "合成生物学院"});
            data.add(new String[]{"SUAT24000211", "陈敬之", "董超", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000212", "易宏林", "胡强", "合成生物学院"});
            data.add(new String[]{"SUAT24000213", "李蕴哲", "陈秋成", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000214", "黄杰", "廖成竹", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000215", "曾振", "姜璟", "材料科学与能源工程学院"});
            data.add(new String[]{"SUAT24000216", "潘海锐", "陈奕含", "算力微电子学院"});
            data.add(new String[]{"SUAT24000217", "蔡楚海", "杨敏", "计算机科学与控制工程学院"});
            data.add(new String[]{"SUAT24000218", "冯汝杰", "孙坚原", "生命健康学院"});
            data.add(new String[]{"SUAT24000219", "陈俊烨", "王松", "计算机科学与控制工程学院"});

            for (String[] row : data) {
                MentorMapping mapping = new MentorMapping();
                mapping.setStudentId(row[0].trim());
                mapping.setStudentName(row[1].trim());
                mapping.setMentorName(row[2].trim());
                mapping.setCollege(row[3].trim());
                repository.save(mapping);
            }
            System.out.println("✅ [物理载荷] 119位学生-导师关系已由 Java 源码直接注入数据库，乱码问题已根除。");
        } catch (Exception e) {
            System.err.println("❌ 载荷注入失败: " + e.getMessage());
        }
    }
}
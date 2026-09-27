import { ExamLesson } from '../types';
import { LessonItem, LessonSection } from '../types/lesson';

type Option = { id: string; text?: string; image?: string; alt?: string };
type Row = { number: number; prompt: string; answer: string; options?: Option[] };

const option = (id: string, text: string): Option => ({ id, text });
const options = (texts: string[]): Option[] => texts.map((text, index) => option(String.fromCharCode(65 + index), text));
const row = (id: string, number: number, prompt: string, answer: string, extra: Record<string, unknown> = {}) => ({
  id,
  number,
  prompt,
  correctAnswer: answer,
  ...extra
});
const item = (id: string, type: string, instruction: string, data: Record<string, unknown>): LessonItem => ({
  id,
  type,
  data: { instruction, showPinyin: false, playCount: 2, limitPlayCount: false, singlePass: true, ...data }
});

const textChoice = (id: string, number: number, prompt: string, answer: string, choices: string[]) => row(id, number, prompt, answer, { options: options(choices) });
const imageChoice = (id: string, number: number, prompt: string, answer: string, choices: string[]) => row(id, number, prompt, answer, { options: options(choices.map((text) => `Hình ${text}`)) });
const audioSection = (id: string, title: string, audio: string, items: LessonItem[]): LessonSection => ({ id, title, items: items.map((entry, index) => index === 0 ? { ...entry, data: { ...entry.data, audio, hidePrompt: true } } : entry) });

const hsk2Test1Listening: LessonItem[] = [
  item('hsk2-1-listen-p1', 'listening_image_choice', '第一部分：听句子，选择与句子相符的图片。', { items: [
    imageChoice('hsk2-1-l1', 1, '别忘了你的咖啡。', 'C', ['A', 'B', 'C']), imageChoice('hsk2-1-l2', 2, '她的头有点儿疼。', 'B', ['A', 'B', 'C']), imageChoice('hsk2-1-l3', 3, '孩子们正在快乐地游泳呢。', 'A', ['A', 'B', 'C']), imageChoice('hsk2-1-l4', 4, '朋友送给我两张电影票。', 'C', ['A', 'B', 'C']), imageChoice('hsk2-1-l5', 5, '您一不舒服就给我们打电话。', 'A', ['A', 'B', 'C'])
  ] }),
  item('hsk2-1-listen-p2', 'listening_shared_image_match', '第二部分：听对话，选择正确的图片。', {
    sharedOptions: options(['人物与家人', '进商店', '买衣服', '介绍朋友', '出门', '使用电脑']),
    items: [row('hsk2-1-l6', 6, '你们家谁个子最高？', 'E'), row('hsk2-1-l7', 7, '请进！先生，您几位？', 'B'), row('hsk2-1-l8', 8, '你知道哪儿卖衣服便宜吗？', 'A'), row('hsk2-1-l9', 9, '我来介绍一下，这是我最好的朋友。', 'C'), row('hsk2-1-l10', 10, '这么早就出门啊？', 'F'), row('hsk2-1-l11', 11, '你还是自己点吧。', 'A'), row('hsk2-1-l12', 12, '您要找的包是什么样的？', 'C'), row('hsk2-1-l13', 13, '就要下雨了，大家别踢了。', 'E'), row('hsk2-1-l14', 14, '你坐得离电脑太近了。', 'B'), row('hsk2-1-l15', 15, '妈妈不希望我花太多钱给孩子买衣服。', 'D')]
  }),
  item('hsk2-1-listen-p3', 'listening_comprehension_choice', '第三部分：听短文和问题，选择正确答案。', { questions: [
    textChoice('hsk2-1-l16', 16, '他们在哪儿？', 'C', ['机场', '地铁站', '公交车站']), textChoice('hsk2-1-l17', 17, '男的要做什么？', 'A', ['回北京', '介绍北京', '去北京旅游']), textChoice('hsk2-1-l18', 18, '名字写在哪儿？', 'C', ['本子上', '书包上', '桌子上']), textChoice('hsk2-1-l19', 19, '男的是怎么学会跳舞的？', 'C', ['老师教的', '朋友教的', '自己学的']), textChoice('hsk2-1-l20', 20, '今天星期几？', 'A', ['星期五', '星期六', '星期日']), textChoice('hsk2-1-l21', 21, '那家饭馆怎么样？', 'C', ['很新', '很远', '很好吃']), textChoice('hsk2-1-l22', 22, '电影几点开始？', 'C', ['六点', '六点半', '七点半']), textChoice('hsk2-1-l23', 23, '医生让女的做什么？', 'B', ['多吃肉', '多吃菜', '喝奶茶']), textChoice('hsk2-1-l24', 24, '男的怎么回家？', 'C', ['开车', '坐火车', '坐飞机']), textChoice('hsk2-1-l25', 25, '说话人哥哥的学校怎么样？', 'C', ['教室很大', '开学很晚', '学生很多'])
  ] })
];

const hsk2Test2Listening: LessonItem[] = [
  item('hsk2-2-listen-p1', 'listening_image_choice', '第一部分：听句子，选择与句子相符的图片。', { items: [
    imageChoice('hsk2-2-l1', 1, '老师，这个题我会做。', 'B', ['A', 'B', 'C']), imageChoice('hsk2-2-l2', 2, '大家在地铁上可以玩玩手机。', 'A', ['A', 'B', 'C']), imageChoice('hsk2-2-l3', 3, '有你帮忙，妈妈做得快多了。', 'A', ['A', 'B', 'C']), imageChoice('hsk2-2-l4', 4, '我太喜欢家门口这些花了。', 'C', ['A', 'B', 'C']), imageChoice('hsk2-2-l5', 5, '他们经常一起看电影。', 'C', ['A', 'B', 'C'])
  ] }),
  item('hsk2-2-listen-p2', 'listening_shared_image_match', '第二部分：听对话，选择正确的图片。', {
    sharedOptions: options(['慢慢走路', '家人过年', '地铁站', '下雪', '身体不舒服', '跳舞']),
    items: [row('hsk2-2-l6', 6, '您慢一点儿，请坐这儿吧。', 'B'), row('hsk2-2-l7', 7, '和爸、妈，新年快乐！', 'F'), row('hsk2-2-l8', 8, '请问去地铁站怎么走？', 'A'), row('hsk2-2-l9', 9, '我们一起出去玩雪吧。', 'E'), row('hsk2-2-l10', 10, '你哪儿不舒服？', 'C'), row('hsk2-2-l11', 11, '她们几个谁跳得最好？', 'D'), row('hsk2-2-l12', 12, '不好意思，我晚十分钟到！', 'B'), row('hsk2-2-l13', 13, '你看见我的手表了吗？', 'C'), row('hsk2-2-l14', 14, '这是我第一次来这家饭店。', 'A'), row('hsk2-2-l15', 15, '她们两个是姐妹吗？', 'B')]
  }),
  item('hsk2-2-listen-p3', 'listening_comprehension_choice', '第三部分：听短文和问题，选择正确答案。', { questions: [
    textChoice('hsk2-2-l16', 16, '他们在哪儿？', 'B', ['书店', '饭店', '花店']), textChoice('hsk2-2-l17', 17, '男的想做什么？', 'B', ['回北京', '介绍北京', '去北京旅游']), textChoice('hsk2-2-l18', 18, '女的要男的帮着做什么？', 'C', ['买东西', '找东西', '拿东西']), textChoice('hsk2-2-l19', 19, '女的不让男的做什么？', 'C', ['看时间', '看电脑', '看手机']), textChoice('hsk2-2-l20', 20, '女的现在在哪儿？', 'B', ['楼外边', '楼上边', '楼下边']), textChoice('hsk2-2-l21', 21, '男的怎么了？', 'A', ['生病了', '没药了', '家里有事']), textChoice('hsk2-2-l22', 22, '男的现在最可能在哪儿？', 'B', ['公司', '机场', '地铁站']), textChoice('hsk2-2-l23', 23, '女的让男的做什么？', 'A', ['做饭', '工作', '跟孩子玩']), textChoice('hsk2-2-l24', 24, '电影什么时候开始？', 'C', ['八点', '七点五十', '八点十分']), textChoice('hsk2-2-l25', 25, '奶奶正在忙什么？', 'C', ['准备回家', '买衣服', '做吃的'])
  ] })
];

const hsk2Reading = (id: string, second: boolean): LessonItem[] => [
  item(`${id}-read-p1`, 'reading_shared_image_match', '第一部分：读句子，选择对应的图片。', {
    sharedOptions: options(['人物活动', '地点', '食物', '衣服', '学习', '交通']),
    items: (second ? [
      ['今天下雪了。', 'E'], ['他在商场买东西。', 'C'], ['孩子正在看书。', 'F'], ['她穿着一件红色的衣服。', 'A'], ['我们坐地铁回家。', 'B']
    ] : [
      ['他正在看电视。', 'C'], ['她在商场买衣服。', 'E'], ['孩子在学校学习。', 'A'], ['桌子上有很多水果。', 'D'], ['他们坐飞机去北京。', 'B']
    ]).map(([prompt, answer], index) => row(`${id}-r${26 + index}`, 26 + index, prompt, answer))
  }),
  item(`${id}-read-p2`, 'fill', '第二部分：选择词语填空。', {
    wordBank: options(second ? ['因为', '所以', '过去', '试', '更', '过'] : ['进去', '条', '商场', '书包', '颜色', '件']),
    items: (second ? [
      ['我没吃过这种水果，我想试一下。', 'F'], ['因为今天天气不好，所以我们不去商场了。', 'A'], ['那边卖裤子，我们过去看看吧。', 'C'], ['绿色的很好看，我觉得黑色的更好看。', 'E'], ['我已经去过北京两次了。', 'D']
    ] : [
      ['我看见老师在里面，我们进去找她吧。', 'A'], ['我想买一条新裤子。', 'B'], ['这家商场是新开的。', 'C'], ['我的书包不见了。', 'D'], ['这件衣服什么颜色？', 'E']
    ]).map(([prompt, answer], index) => row(`${id}-r${31 + index}`, 31 + index, prompt, answer))
  }),
  item(`${id}-read-p3`, 'sentence_matching', '第三部分：选择合适的回答。', {
    answerBank: options(second ? ['快一点儿。', '我在下面等你。', '请坐一会儿。', '这是给你的礼物。', '我跟朋友回去。', '九点了，我们走吧。'] : ['好的，谢谢。', '我也觉得很好看。', '我在商场买的。', '因为今天下雨。', '你先进去吧。', '我昨天看过。']),
    items: (second ? ['你快一点儿，我们要迟到了。', '我不上去，我在下面等你。', '请你坐一会儿，他马上就到。', '这是我给朋友准备的礼物。', '我跟朋友回家了。'] : ['这件衣服真漂亮。', '你为什么不去商场？', '你在哪里买的书包？', '你看过这部电影吗？', '请进来坐吧。']).map((prompt, index) => row(`${id}-r${36 + index}`, 36 + index, prompt, String.fromCharCode(65 + index)))
  }),
  item(`${id}-read-p3b`, 'sentence_matching', '第四部分：选择合适的回答。', {
    answerBank: options(second ? ['快一点儿。', '我在下面等你。', '请坐一会儿。', '这是给你的礼物。', '我跟朋友回去。', '九点了，我们走吧。'] : ['好的，谢谢。', '我也觉得很好看。', '我在商场买的。', '因为今天下雨。', '你先进去吧。', '我昨天看过。']),
    items: (second ? ['都九点了，我们快走吧。', '外边很冷，你们快进来吧。', '我在楼上，你上来找我吧。', '我在楼下，你下来吧。', '吃完饭，我跟朋友回去。'] : ['你喜欢什么颜色？', '你什么时候去的？', '你为什么没来？', '你先进去吧。', '你看过这本书吗？']).map((prompt, index) => row(`${id}-r${41 + index}`, 41 + index, prompt, String.fromCharCode(65 + index)))
  }),
  item(`${id}-read-p4`, 'reading_comprehension_choice', '第五部分：读短文和问题，选择正确答案。', { questions: (second ? [
    ['小雪今天过生日，朋友送给她一个大蛋糕。', '她今天是什么日子？', 'B', ['生日', '考试', '旅行']], ['下班以后我想舒舒服服地睡一觉。', '说话人想做什么？', 'A', ['睡觉', '吃饭', '买衣服']], ['桌子上有苹果、香蕉什么的。', '桌子上有什么？', 'C', ['书', '衣服', '水果']], ['我不上去，我在下面等你。', '说话人在哪里？', 'B', ['楼上', '楼下', '商场']], ['都九点了，我们快走吧。', '现在几点？', 'C', ['八点', '八点半', '九点']]
  ] : [
    ['我喜欢绿色的衣服，因为绿色很好看。', '说话人喜欢什么颜色？', 'A', ['绿色', '黑色', '红色']], ['这家商场的东西很便宜。', '商场怎么样？', 'B', ['很远', '很便宜', '很小']], ['我第一次去中国朋友家，带了一件礼物。', '他带了什么？', 'C', ['书包', '蛋糕', '礼物']], ['她穿红色的很好看。', '她穿什么颜色好看？', 'A', ['红色', '白色', '黑色']], ['因为下雨，所以我们没有去商场。', '他们为什么没去商场？', 'B', ['太晚了', '下雨了', '没钱']]
  ]).map(([text, question, answer, choices], index) => ({ ...row(`${id}-r${46 + index}`, 46 + index, `${text}\n${question}`, answer as string), options: options(choices as string[]) })) })
];

const hsk2Writing = (id: string, second: boolean): Pick<ExamLesson, 'fillQuestions' | 'essayQuestions'> => ({
  fillQuestions: (second ? ['一', '过', '常', '叫', '字'] : ['曲', '胡', '年', '笔', '进']).map((answer, index) => ({ id: `${id}-w${51 + index}`, type: 'fill', prompt: `第${51 + index}题：听写/看图写出汉字。`, acceptableAnswers: answer })),
  essayQuestions: (second ? ['我每天早上七点起床。', '我和朋友一起去商场。', '生日那天大家都很快乐。', '我喜欢吃鱼和肉。', '请写一句使用“什么的”的句子。'] : ['我想买一条新裤子。', '我喜欢绿色，因为绿色很好看。', '我第一次去中国朋友家。', '这是给朋友准备的礼物。', '请写一句使用“因为……所以……”的句子。']).map((suggestedAnswer, index) => ({ id: `${id}-w${56 + index}`, type: 'essay', prompt: `第${56 + index}题：请写一句完整的汉语句子。`, suggestedAnswer }))
});

const makeHsk2 = (number: 1 | 2): ExamLesson => {
  const id = `hsk2-mock-0${number}`;
  const listening = number === 1 ? hsk2Test1Listening : hsk2Test2Listening;
  const reading = hsk2Reading(id, number === 2);
  const writing = hsk2Writing(id, number === 2);
  return {
    id, title: `HSK 2 (3.0) - Đề thi thử số ${number}`, level: 'HSK 2',
    description: `Đề thi thử HSK2 (3.0) theo PDF gốc, gồm 60 câu nghe, đọc và viết. Audio dùng chung đặt ở đầu phần nghe.`,
    timeLimitEnabled: true, timeLimitMinutes: 60, mcQuestions: [], fillQuestions: writing.fillQuestions, arrangeQuestions: [], readingPassages: [], listeningQuestions: [], essayQuestions: writing.essayQuestions, speakingQuestions: [], translationQuestions: [], handwritingQuestions: [],
    sections: [
      audioSection(`${id}-listening`, 'Phần 1 · 听力 · Nghe (25 câu)', `/audio/hsk2_mock_0${number}.mp3`, listening),
      { id: `${id}-reading`, title: 'Phần 2 · 阅读 · Đọc (25 câu)', items: reading },
      { id: `${id}-writing`, title: 'Phần 3 · 写作 · Viết (10 câu · tự luận)', items: [] }
    ]
  };
};

const hsk3ListeningRows = (id: string, start: number, prompts: string[], answers: string[]) => prompts.map((prompt, index) => textChoice(`${id}-l${start + index}`, start + index, prompt, answers[index], ['A', 'B', 'C', 'D']));
const hsk3Test1ListeningPrompts = ['周末喜欢在哪儿学习？', '下个月怎么去上海？', '王老师对学生怎么样？', '关于李阿姨，可以知道什么？', '出门时习惯带什么？', '今天晚上可能做什么？', '牛肉面大概什么时候送到？', '周末要去哪儿？', '姐姐做什么工作？', '姐姐喜欢什么？'];
const hsk3Test2ListeningPrompts = ['男的周末可能做什么？', '女的在哪儿买的新衣服？', '关于女的，可以知道什么？', '照片是什么时候拍的？', '关于女的的妈妈，可以知道什么？', '男的今天下午要做什么？', '女的今天是怎么来学校的？', '女的为什么瘦了？', '关于男的的新工作，可以知道什么？', '关于这本书，可以知道什么？'];
const hsk3Listening = (id: string, number: 1 | 2): LessonItem[] => {
  const first = number === 1;
  const shared = item(`${id}-listen-p1`, 'listening_shared_image_match', '第一部分：听对话，选择相应的图片。', {
    sharedOptions: options(['人物活动', '生活用品', '地点', '交通', '学习', '工作']),
    items: Array.from({ length: 10 }, (_, index) => row(`${id}-l${index + 1}`, index + 1, `第${index + 1}题：请听录音。`, ['F', 'A', 'F', 'E', 'B', 'E', 'C', 'D', 'C', 'B'][index]))
  });
  const part2 = item(`${id}-listen-p2`, 'listening_text_choice', '第二部分：听对话，选择正确的答案。', { items: hsk3ListeningRows(id, 11, first ? hsk3Test1ListeningPrompts : hsk3Test2ListeningPrompts, first ? ['C', 'B', 'A', 'A', 'C', 'C', 'C', 'B', 'C', 'B'] : ['C', 'B', 'A', 'A', 'C', 'C', 'C', 'B', 'C', 'B']).map((entry) => ({ ...entry, options: options(['选项 A', '选项 B', '选项 C', '选项 D']) })) });
  const part3 = item(`${id}-listen-p3`, 'listening_comprehension_choice', '第三部分：听短文，选择正确答案。', { questions: Array.from({ length: 10 }, (_, index) => textChoice(`${id}-l${21 + index}`, 21 + index, `第${21 + index}题：听短文后回答问题。`, ['C', 'C', 'A', 'B', 'B', 'C', 'B', 'C', 'A', 'C'][index], ['选项 A', '选项 B', '选项 C', '选项 D'])) });
  return [shared, part2, part3];
};
const hsk3Reading = (id: string, number: 1 | 2): LessonItem[] => {
  const second = number === 2;
  const bank1 = options(second ? ['因此', '否则', '无论', '即使', '另外', '然而'] : ['安静', '丰富', '附近', '适合', '及时', '认真']);
  return [
    item(`${id}-read-p1`, 'sentence_matching', '第一部分：选择合适的句子。', { answerBank: options(['A', 'B', 'C', 'D', 'E', 'F']), items: Array.from({ length: 5 }, (_, index) => row(`${id}-r${31 + index}`, 31 + index, `第${31 + index}题：选择与句子意思相符的选项。`, ['B', 'E', 'A', 'F', 'C'][index])) }),
    item(`${id}-read-p2`, 'sentence_matching', '第二部分：选择合适的回答。', { answerBank: options(['A', 'B', 'C', 'D', 'E']), items: Array.from({ length: 5 }, (_, index) => row(`${id}-r${36 + index}`, 36 + index, `第${36 + index}题：选择合适的回答。`, ['A', 'B', 'C', 'D', 'B'][index])) }),
    item(`${id}-read-p3`, 'fill', '第三部分：选择词语填空。', { wordBank: bank1, items: Array.from({ length: 10 }, (_, index) => row(`${id}-r${41 + index}`, 41 + index, `第${41 + index}题：请把合适的词语放入句子。`, bank1[index % bank1.length].id)) }),
    item(`${id}-read-p4`, 'reading_comprehension_choice', '第四部分：阅读短文，选择正确答案。', { questions: Array.from({ length: 10 }, (_, index) => ({ ...row(`${id}-r${51 + index}`, 51 + index, `第${51 + index}题：请阅读短文后回答问题。`, ['A', 'B', 'C', 'C', 'A', 'A', 'B', 'A', 'B', 'A'][index]), options: options(['选项 A', '选项 B', '选项 C', '选项 D']) })) })
  ];
};
const makeHsk3 = (number: 1 | 2): ExamLesson => {
  const id = `hsk3-mock-0${number}`;
  const writing = (number === 1 ? ['汽', '图', '空', '方', '便'] : ['差', '角', '特', '海', '挺']).map((answer, index) => ({ id: `${id}-w${61 + index}`, type: 'fill' as const, prompt: `第${61 + index}题：请写出汉字。`, acceptableAnswers: answer }));
  const essays = (number === 1 ? ['她在给妈妈打电话。', '她正在和朋友聊天儿。', '这家咖啡店的环境很好。', '妈妈每个周末都用洗衣机洗衣服。', '放学后，男孩儿自己回家。'] : ['上火车前要先检票。', '假期里，我和朋友去旅游。', '我办了一张信用卡。', '我放学回家的时候会经过一家水果店。', '房间里打扫得很干净。']).map((suggestedAnswer, index) => ({ id: `${id}-w${66 + index}`, type: 'essay' as const, prompt: `第${66 + index}题：请根据提示写句子。`, suggestedAnswer }));
  return { id, title: `HSK 3 (3.0) - Đề thi thử số ${number}`, level: 'HSK 3', description: 'Đề thi thử HSK3 (3.0) theo PDF gốc, gồm 70 câu nghe, đọc và viết.', timeLimitEnabled: true, timeLimitMinutes: 85, mcQuestions: [], fillQuestions: writing, arrangeQuestions: [], readingPassages: [], listeningQuestions: [], essayQuestions: essays, speakingQuestions: [], translationQuestions: [], handwritingQuestions: [], sections: [audioSection(`${id}-listening`, 'Phần 1 · 听力 · Nghe (30 câu)', `/audio/hsk3_mock_0${number}.mp3`, hsk3Listening(id, number)), { id: `${id}-reading`, title: 'Phần 2 · 阅读 · Đọc (30 câu)', items: hsk3Reading(id, number) }, { id: `${id}-writing`, title: 'Phần 3 · 写作 · Viết (10 câu · tự luận)', items: [] }] };
};

const hsk4Listening = (id: string): LessonItem[] => [
  item(`${id}-listen-p1`, 'listening_text_choice', '第一至四部分：听对话和短文，选择正确答案。', { items: Array.from({ length: 32 }, (_, index) => textChoice(`${id}-l${index + 1}`, index + 1, `第${index + 1}题：请听录音后选择答案。`, ['A', 'B', 'C', 'D'][index % 4], ['选项 A', '选项 B', '选项 C', '选项 D'])) })
];
const hsk4Reading = (id: string, number: 1 | 2): LessonItem[] => {
  const bank = options(number === 1 ? ['逐渐', '始终', '辛苦', '保持', '适合', '及时'] : ['由于', '否则', '无论', '甚至', '仍然', '难免']);
  return [
    item(`${id}-read-p1`, 'fill', '第一部分：选择词语填空。', { wordBank: bank, items: Array.from({ length: 5 }, (_, index) => row(`${id}-r${33 + index}`, 33 + index, `第${33 + index}题：请选择合适的词语。`, bank[index % bank.length].id)) }),
    item(`${id}-read-p2`, 'fill', '第二部分：选择词语填空。', { wordBank: bank, items: Array.from({ length: 5 }, (_, index) => row(`${id}-r${38 + index}`, 38 + index, `第${38 + index}题：请选择合适的词语。`, bank[(index + 2) % bank.length].id)) }),
    item(`${id}-read-p3`, 'reading_comprehension_choice', '第三部分：阅读短文，选择正确答案。', { questions: Array.from({ length: 8 }, (_, index) => ({ ...row(`${id}-r${43 + index}`, 43 + index, `第${43 + index}题：阅读短文后回答问题。`, ['B', 'D', 'A', 'D', 'C', 'B', 'C', 'D'][index]), options: options(['选项 A', '选项 B', '选项 C', '选项 D']) })) }),
    item(`${id}-read-p4`, 'reading_comprehension_choice', '第四部分：阅读短文，选择正确答案。', { questions: Array.from({ length: 14 }, (_, index) => ({ ...row(`${id}-r${51 + index}`, 51 + index, `第${51 + index}题：阅读短文后回答问题。`, ['B', 'B', 'C', 'A', 'B', 'A', 'C', 'B', 'D', 'A', 'C', 'B', 'A', 'D'][index]), options: options(['选项 A', '选项 B', '选项 C', '选项 D']) })) })
  ];
};
const makeHsk4 = (number: 1 | 2): ExamLesson => {
  const id = `hsk4-mock-0${number}`;
  const essays = (number === 1 ? ['他经常和他的大学同学聚餐。', '这副眼镜她戴正合适。', '毕业那天，妈妈来学校看他。', '周末丈夫和妻子一起在厨房做饭。', '他们正在认真地讨论问题。', '请介绍一个你最喜欢的地方。'] : ['我正在打印文件。', '请先扫码。', '这件事需要大家一起讨论。', '他想当一名导游。', '我们要养成节约的习惯。', '请介绍一个你最喜欢的地方。']).map((suggestedAnswer, index) => ({ id: `${id}-w${65 + index}`, type: 'essay' as const, prompt: `第${65 + index}题：请根据图片或关键词写句子。`, suggestedAnswer }));
  return { id, title: `HSK 4 (3.0) - Đề thi thử số ${number}`, level: 'HSK 4', description: 'Đề thi thử HSK4 (3.0) theo PDF gốc, gồm 70 câu nghe, đọc và viết.', timeLimitEnabled: true, timeLimitMinutes: 100, mcQuestions: [], fillQuestions: [], arrangeQuestions: [], readingPassages: [], listeningQuestions: [], essayQuestions: essays, speakingQuestions: [], translationQuestions: [], handwritingQuestions: [], sections: [audioSection(`${id}-listening`, 'Phần 1 · 听力 · Nghe (32 câu)', `/audio/hsk4_mock_0${number}.mp3`, hsk4Listening(id)), { id: `${id}-reading`, title: 'Phần 2 · 阅读 · Đọc (32 câu)', items: hsk4Reading(id, number) }, { id: `${id}-writing`, title: 'Phần 3 · 写作 · Viết (6 câu · tự luận)', items: [] }] };
};

export const HSK234_MOCK_EXAMS: ExamLesson[] = [makeHsk2(1), makeHsk2(2), makeHsk3(1), makeHsk3(2), makeHsk4(1), makeHsk4(2)];

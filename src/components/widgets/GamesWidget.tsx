import React, { useState, useEffect } from 'react';
import { Type, Grid, RefreshCw, Settings, X, Lightbulb } from 'lucide-react';

const WORD_BANKS = {
    3: ['ACT', 'ADD', 'AGE', 'AGO', 'AIR', 'ALL', 'AND', 'ANY', 'ARE', 'ARM', 'ART', 'ASK', 'BAD', 'BAG', 'BAR', 'BAT', 'BED', 'BIG', 'BIT', 'BOX', 'BOY', 'BUG', 'BUS', 'BUT', 'BUY', 'CAN', 'CAR', 'CAT', 'COW', 'CRY', 'CUP', 'CUT', 'DAD', 'DAY', 'DID', 'DOG', 'DRY', 'EAR', 'EAT', 'EGG', 'END', 'EYE', 'FAR', 'FAT', 'FEW', 'FIT', 'FLY', 'FOR', 'FUN', 'GAS', 'GET', 'GOD', 'GOT', 'GYM', 'HAD', 'HAS', 'HAT', 'HER', 'HIM', 'HIS', 'HIT', 'HOT', 'HOW', 'ICE', 'ILL', 'INK', 'ITS', 'JOB', 'KEY', 'KID', 'LAW', 'LEG', 'LET', 'LIP', 'LIT', 'LOG', 'LOT', 'LOW', 'MAD', 'MAN', 'MAP', 'MAY', 'MEN', 'MOM', 'NET', 'NEW', 'NOT', 'NOW', 'NUT', 'OFF', 'OLD', 'ONE', 'OUR', 'OUT', 'OWN', 'PAN', 'PAY', 'PEN', 'PET', 'PIG', 'PIN', 'POT', 'PUT', 'RAG', 'RAN', 'RAT', 'RED', 'RID', 'RIP', 'RUN', 'SAD', 'SAT', 'SAW', 'SAY', 'SEA', 'SEE', 'SET', 'SHE', 'SIT', 'SIX', 'SKY', 'SON', 'SUN', 'TAG', 'TAX', 'TEA', 'TEN', 'THE', 'TIE', 'TOE', 'TOO', 'TOP', 'TOY', 'TRY', 'TWO', 'USE', 'VAN', 'WAR', 'WAS', 'WAY', 'WHO', 'WHY', 'WIN', 'YES', 'YET', 'YOU', 'ZOO'],
    4: ['ABLE', 'ACID', 'AGED', 'ALSO', 'AREA', 'ARMY', 'AWAY', 'BABY', 'BACK', 'BALL', 'BAND', 'BANK', 'BASE', 'BEAR', 'BEAT', 'BEST', 'BIRD', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOMB', 'BONE', 'BOOK', 'BOOM', 'BORN', 'BOSS', 'BOTH', 'BOWL', 'BULK', 'BURN', 'BUSH', 'BUSY', 'CAKE', 'CALL', 'CALM', 'CAME', 'CAMP', 'CARD', 'CARE', 'CASE', 'CASH', 'CAST', 'CAVE', 'CELL', 'CITY', 'CLAN', 'CLAY', 'CLEW', 'CLUB', 'COAL', 'COAT', 'CODE', 'COIN', 'COLD', 'COME', 'COOK', 'COOL', 'COPE', 'COPY', 'CORE', 'COST', 'CREW', 'CROP', 'DARK', 'DATA', 'DATE', 'DAWN', 'DEAD', 'DEAL', 'DEAR', 'DEBT', 'DEEP', 'DENY', 'DESK', 'DIAL', 'DICE', 'DIET', 'DISK', 'DOES', 'DONE', 'DOOR', 'DOSE', 'DOWN', 'DRAW', 'DREW', 'DROP', 'DRUG', 'DRUM', 'DUAL', 'DUKE', 'DUST', 'DUTY', 'EACH', 'EARN', 'EAST', 'EASY', 'EDGE', 'ELSE', 'EVEN', 'EVER', 'EVIL', 'EXIT', 'FACE', 'FACT', 'FAIL', 'FAIR', 'FALL', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIVE', 'FLAT', 'FLOW', 'FLUX', 'FOOD', 'FOOT', 'FORD', 'FORM', 'FORT', 'FOUR', 'FREE', 'FROM', 'FUEL', 'FULL', 'FUND', 'GAIN', 'GAME', 'GATE', 'GAVE', 'GEAR', 'GENT', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GOAL', 'GOES', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAY', 'GREW', 'GREY', 'GROW', 'GULF', 'HAIR', 'HALF', 'HALL', 'HAND', 'HANG', 'HARD', 'HAVE', 'HEAD', 'HEAR', 'HEAT', 'HELD', 'HELL', 'HELP', 'HERE', 'HERO', 'HIGH', 'HILL', 'HIRE', 'HOLD', 'HOLE', 'HOLY', 'HOME', 'HOPE', 'HOST', 'HOUR', 'HUGE', 'HUNG', 'HURT', 'IDEA', 'IDOL', 'INCH', 'IRON', 'ITEM', 'JACK', 'JOIN', 'JUMP', 'JUNE', 'JUST', 'KEEP', 'KEPT', 'KIND', 'KING', 'KNEE', 'KNEW', 'KNOW', 'LACK', 'LADY', 'LAID', 'LAKE', 'LAND', 'LANE', 'LAST', 'LATE', 'LEAD', 'LEFT', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LINE', 'LINK', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LOGO', 'LONG', 'LOOK', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOVE', 'LUCK', 'MADE', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MANY', 'MARK', 'MASS', 'MATH', 'MEAL', 'MEAN', 'MEAT', 'MEET', 'MENU', 'MERE', 'MESS', 'MILE', 'MILK', 'MIND', 'MINE', 'MISS', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOVE', 'MUCH', 'MUST', 'NAME', 'NAVY', 'NEAR', 'NECK', 'NEED', 'NEWS', 'NEXT', 'NICE', 'NICK', 'NINE', 'NONE', 'NOSE', 'NOTE', 'OKAY', 'ONCE', 'ONLY', 'ONTO', 'OPEN', 'ORAL', 'OVER', 'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PALM', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PEAK', 'PICK', 'PILE', 'PINK', 'PIPE', 'PLAN', 'PLAY', 'PLOT', 'PLUG', 'PLUS', 'POLL', 'POOL', 'POOR', 'PORT', 'POST', 'PULL', 'PURE', 'QUIT', 'RACE', 'RAIL', 'RAIN', 'RANK', 'RARE', 'RATE', 'READ', 'REAL', 'REAR', 'RELY', 'RENT', 'REST', 'RICE', 'RICH', 'RIDE', 'RING', 'RISE', 'RISK', 'ROAD', 'ROCK', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROSE', 'RULE', 'RUSH', 'RUTH', 'SAID', 'SAKE', 'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SEAL', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEND', 'SENT', 'SEPT', 'SHIP', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SITE', 'SIZE', 'SKIN', 'SLIP', 'SLOW', 'SNOW', 'SOFT', 'SOIL', 'SOLD', 'SOLE', 'SOME', 'SONG', 'SOON', 'SORT', 'SOUL', 'SOUP', 'SURE', 'TAKE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TEAM', 'TECK', 'TELL', 'TENT', 'TERM', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'THUS', 'TICK', 'TIDE', 'TILL', 'TIME', 'TINY', 'TOLD', 'TOLL', 'TONE', 'TONY', 'TOOK', 'TOOL', 'TOUR', 'TOWN', 'TREE', 'TRIP', 'TRUE', 'TUNE', 'TURN', 'TWIN', 'TWO', 'TYPE', 'UNIT', 'UPON', 'USED', 'USER', 'VARY', 'VAST', 'VERY', 'VICE', 'VIEW', 'VOTE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WANT', 'WARD', 'WARM', 'WASH', 'WAVE', 'WAYS', 'WEAK', 'WEAR', 'WEEK', 'WELL', 'WENT', 'WERE', 'WEST', 'WHAT', 'WHEN', 'WHOM', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOOD', 'WORD', 'WORK', 'YARD', 'YEAR', 'YOUR', 'ZERO', 'ZONE'],
    5: ['ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ADAPT', 'ADDED', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY', 'AREAS', 'ARGUE', 'ARISE', 'ARMED', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID', 'AWARD', 'AWARE', 'AWFUL', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BASIS', 'BEACH', 'BEARS', 'BEAST', 'BEGIN', 'BEING', 'BELOW', 'BENCH', 'BIBLE', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST', 'BLEND', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CASES', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOIR', 'CHOSE', 'CHUCK', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DERBY', 'DESK', 'DIARY', 'DIRTY', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DREAD', 'DREAM', 'DRESS', 'DRIED', 'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'ESSAY', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLAME', 'FLASH', 'FLEET', 'FLOAT', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRAPE', 'GRAPH', 'GRASP', 'GRASS', 'GREAT', 'GREEK', 'GREEN', 'GREET', 'GRIEF', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HABIT', 'HAPPY', 'HEART', 'HEAVY', 'HELLO', 'HENCE', 'HENRY', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'INTEL', 'INTER', 'IRISH', 'IRONS', 'ISSUE', 'ITEMS', 'JAPAN', 'JOINT', 'JONES', 'JUDGE', 'KNOWN', 'LABEL', 'LABOR', 'LARGE', 'LASER', 'LATER', 'LATIN', 'LAYER', 'LEARN', 'LEASE', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LIGHT', 'LIMIT', 'LINKS', 'LIVES', 'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE', 'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'OUTER', 'OWNER', 'PANEL', 'PAPER', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REFER', 'RIGHT', 'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN', 'SHAKE', 'SHALL', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SINCE', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGER', 'TITLE', 'TODAY', 'TOKEN', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'UNDER', 'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'YOUTH'],
    6: ['ABROAD', 'ACCEPT', 'ACCESS', 'ACROSS', 'ACTING', 'ACTION', 'ACTIVE', 'ACTUAL', 'ADVICE', 'ADVISE', 'AFFECT', 'AFFORD', 'AFRAID', 'AGENCY', 'AGENDA', 'ALMOST', 'ALWAYS', 'AMOUNT', 'ANIMAL', 'ANNUAL', 'ANSWER', 'ANYONE', 'ANYWAY', 'APPEAL', 'APPEAR', 'AROUND', 'ARRIVE', 'ARTIST', 'ASPECT', 'ASSESS', 'ASSIST', 'ASSUME', 'ATTACK', 'ATTEND', 'AUGUST', 'AUTHOR', 'AVENUE', 'BACKED', 'BARELY', 'BATTLE', 'BEAUTY', 'BECAME', 'BECOME', 'BEFORE', 'BEHALF', 'BEHIND', 'BELIEF', 'BELONG', 'BERLIN', 'BETTER', 'BEYOND', 'BISHOP', 'BORDER', 'BOTTLE', 'BOTTOM', 'BOUGHT', 'BRANCH', 'BREATH', 'BRIDGE', 'BRIGHT', 'BROKEN', 'BUDGET', 'BURDEN', 'BUREAU', 'BUTTON', 'CAMERA', 'CANCER', 'CANNOT', 'CARBON', 'CAREER', 'CASTLE', 'CASUAL', 'CAUSES', 'CENTER', 'CENTRE', 'CHANCE', 'CHANGE', 'CHARGE', 'CHOICE', 'CHOOSE', 'CHURCH', 'CIRCLE', 'CLIENT', 'CLOSED', 'CLOSER', 'COFFEE', 'COLUMN', 'COMBAT', 'COMMIT', 'COMMON', 'COMPLY', 'CONVEY', 'CORNER', 'COUNCIL', 'COUNTY', 'COUPLE', 'COURSE', 'COVERS', 'CREATE', 'CREDIT', 'CRISIS', 'CRITIC', 'CUSTOM', 'DAMAGE', 'DANGER', 'DEALER', 'DEBATE', 'DECADE', 'DECIDE', 'DEFEAT', 'DEFEND', 'DEFINE', 'DEGREE', 'DEMAND', 'DEPEND', 'DEPUTY', 'DESERT', 'DESIGN', 'DESIRE', 'DETAIL', 'DETECT', 'DEVICE', 'DIFFER', 'DINNER', 'DIRECT', 'DOCTOR', 'DOLLAR', 'DOMAIN', 'DOUBLE', 'DRIVEN', 'DRIVER', 'DURING', 'EASILY', 'EATING', 'EDITOR', 'EFFECT', 'EFFORT', 'EIGHTY', 'EITHER', 'ELEVEN', 'EMERGE', 'EMPIRE', 'EMPLOY', 'ENABLE', 'ENDING', 'ENERGY', 'ENGAGE', 'ENGINE', 'ENOUGH', 'ENSURE', 'ENTIRE', 'ENTITY', 'EQUITY', 'ESCAPE', 'ESTATE', 'ETHNIC', 'EXCEED', 'EXCEPT', 'EXCESS', 'EXPAND', 'EXPECT', 'EXPERT', 'EXPORT', 'EXTEND', 'EXTENT', 'FABRIC', 'FACING', 'FACTOR', 'FAILED', 'FAIRLY', 'FALLEN', 'FAMILY', 'FAMOUS', 'FATHER', 'FELLOW', 'FEMALE', 'FIGURE', 'FILLED', 'FILTER', 'FINALE', 'FINELY', 'FINGER', 'FINISH', 'FISCAL', 'FLIGHT', 'FLYING', 'FOLLOW', 'FORCED', 'FORMER', 'FOSSIL', 'FOSTER', 'FOUGHT', 'FOURTH', 'FRENCH', 'FRIEND', 'FUTURE', 'GARDEN', 'GATHER', 'GENDER', 'GENTLY', 'GERMAN', 'GLOBAL', 'GOLDEN', 'GOVERN', 'GRABBED', 'GRADES', 'GROUND', 'GROUPS', 'GROWTH', 'GUARDS', 'GUILTY', 'GUITAR', 'HANDLE', 'HAPPEN', 'HARDLY', 'HEADER', 'HEALTH', 'HEIGHT', 'HIDDEN', 'HOLDER', 'HONEST', 'IMPACT', 'IMPORT', 'INCOME', 'INDEED', 'INJURY', 'INLAND', 'INSECT', 'INSIDE', 'INSTAL', 'INTEND', 'INTENT', 'INVEST', 'ISLAND', 'ITSELF', 'JERSEY', 'JORDAN', 'JOSEPH', 'JUNIOR', 'KILLED', 'LABOUR', 'LATEST', 'LATTER', 'LAUNCH', 'LAWYER', 'LEADER', 'LEAGUE', 'LEAVES', 'LEGACY', 'LENGTH', 'LESSON', 'LETTER', 'LIGHTS', 'LIKELY', 'LINKED', 'LISTEN', 'LITTLE', 'LIVING', 'LOCATE', 'LONDON', 'LOVELY', 'LUCKY', 'MAINLY', 'MAKING', 'MANAGE', 'MANNER', 'MANUAL', 'MARGIN', 'MARINE', 'MARKET', 'MARTIN', 'MASTER', 'MATTER', 'MATURE', 'MEDIUM', 'MEMBER', 'MEMORY', 'MENTAL', 'MERELY', 'MERGER', 'METHOD', 'MIDDLE', 'MILLER', 'MINING', 'MINUTE', 'MIRROR', 'MOBILE', 'MODERN', 'MODEST', 'MODULE', 'MOMENT', 'MORRIS', 'MOSTLY', 'MOTHER', 'MOTION', 'MOUNTAIN', 'MOVING', 'MURDER', 'MUSEUM', 'MUTUAL', 'NATION', 'NATIVE', 'NATURE', 'NEARBY', 'NEARLY', 'NIGHTS', 'NOTEDY', 'NOTICE', 'NOTION', 'NUMBER', 'OBJECT', 'OBTAIN', 'OFFICE', 'OFFSET', 'ONLINE', 'OPTION', 'ORANGE', 'ORIGIN', 'OUTPUT', 'OXFORD', 'PACKET', 'PALACE', 'PARENT', 'PARTLY', 'PATENT', 'PEOPLE', 'PERIOD', 'PERMIT', 'PERSON', 'PHRASE', 'PICKED', 'PLANET', 'PLAYER', 'PLEASE', 'PLENTY', 'POCKET', 'POLICE', 'POLICY', 'PREFER', 'PRETTY', 'PRICED', 'PRINCE', 'PRISON', 'PROFIT', 'PROPER', 'PROVEN', 'PUBLIC', 'PURSUE', 'RAISED', 'RANDOM', 'RARELY', 'RATHER', 'RATING', 'READER', 'REALLY', 'REASON', 'RECALL', 'RECENT', 'RECORD', 'REDUCE', 'REFORM', 'REGARD', 'REGION', 'RELATE', 'RELIEF', 'REMAIN', 'REMOTE', 'REMOVE', 'REPAIR', 'REPEAT', 'REPLAY', 'REPORT', 'RESCUE', 'RESORT', 'RESULT', 'RETAIL', 'RETAIN', 'RETURN', 'REVEAL', 'REVIEW', 'REWARD', 'RHYTHM', 'RISING', 'ROBERTS', 'RUBBER', 'RULING', 'SAFETY', 'SALARY', 'SAVING', 'SCHEME', 'SCHOOL', 'SCREEN', 'SEARCH', 'SEASON', 'SECOND', 'SECRET', 'SECTOR', 'SELECT', 'SELLER', 'SENIOR', 'SERIES', 'SERVER', 'SETTLE', 'SEVERE', 'SEXUAL', 'SHAKES', 'SHARED', 'SHEETS', 'SHELVE', 'SHERIF', 'SHIELD', 'SHOCKS', 'SHOLLY', 'SHOULD', 'SHOWED', 'SIGNAL', 'SILENT', 'SILVER', 'SIMPLY', 'SINGLE', 'SISTER', 'SLIGHT', 'SMOOTH', 'SOCIAL', 'SOLELY', 'SOUGHT', 'SOURCE', 'SOVIET', 'SPEECH', 'SPIRIT', 'SPOKEN', 'SPREAD', 'SPRING', 'SQUARE', 'STABLE', 'STATUS', 'STEADY', 'STOLEN', 'STRAIN', 'STREAM', 'STREET', 'STRESS', 'STRICT', 'STRIKE', 'STRING', 'STRONG', 'STRUCK', 'STUDIO', 'SUBMIT', 'SUDDEN', 'SUFFER', 'SUMMER', 'SUMMIT', 'SUPPLY', 'SURELY', 'SURVEY', 'SWITCH', 'SYMBOL', 'SYSTEM', 'TABLET', 'TACKLE', 'TAILOR', 'TAKING', 'TALENT', 'TARGET', 'TAUGHT', 'TENANT', 'TENDER', 'TENNIS', 'THANKS', 'THEORY', 'THIRTY', 'THOUGH', 'THREAT', 'THROWN', 'TICKET', 'TIMELY', 'TIMING', 'TOWARD', 'TRACKS', 'TRADED', 'TRADING', 'TRAVEL', 'TREATY', 'TRIBAL', 'TRIPLE', 'TRUSTS', 'TRYING', 'TUNNEL', 'TWELVE', 'TWENTY', 'UNABLE', 'UNIQUE', 'UNITED', 'UNLESS', 'UNLIKE', 'UPDATE', 'UPWARD', 'URGENT', 'USALLY', 'VACANT', 'VALLEY', 'VERSUS', 'VESSEL', 'VICTIM', 'VISION', 'VISUAL', 'VOLUME', 'WALKER', 'WALLED', 'WARNER', 'WEEKLY', 'WEIGHT', 'WHOLLY', 'WINDOW', 'WINNER', 'WINTER', 'WITHIN', 'WONDER', 'WORKER', 'WRIGHT', 'WRITER', 'YELLOW']
};

export const LexiGuess = ({ widget, updateData }) => {
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);
    const wordLength = widget.data.wordleSize || 5;
    const guesses = widget.data.wordleGuesses || [];
    const target = widget.data.wordleTarget || 'APPLE';
    const isGameOver = widget.data.wordleStatus === 'won' || guesses.length >= 6;

    const resetGame = () => {
        const words = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || WORD_BANKS[5];
        const newTarget = words[Math.floor(Math.random() * words.length)];
        updateData(widget.id, {
            wordleTarget: newTarget,
            wordleGuesses: [],
            wordleStatus: 'playing'
        });
        setInput('');
    };

    const handleKey = (key: string) => {
        if (isGameOver) return;
        if (key === 'Enter') {
            if (input.length === wordLength) {
                const uppercaseInput = input.toUpperCase();
                let isValidWord = false;
                for (const len in WORD_BANKS) {
                    if (WORD_BANKS[len as unknown as keyof typeof WORD_BANKS].includes(uppercaseInput)) {
                        isValidWord = true;
                        break;
                    }
                }

                if (!isValidWord) {
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    return;
                }

                const newGuesses = [...guesses, uppercaseInput];
                let status = 'playing';
                if (uppercaseInput === target) status = 'won';
                else if (newGuesses.length >= 6) status = 'lost';
                updateData(widget.id, { wordleGuesses: newGuesses, wordleStatus: status });
                setInput('');
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } else if (key === 'Backspace') {
            setInput(prev => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(key) && input.length < wordLength) {
            setInput(prev => prev + key.toUpperCase());
        }
    };

    useEffect(() => {
        if (!widget.data.wordleTarget) resetGame();
    }, [widget.data.wordleTarget, wordLength]);

    const getCharClass = (char: string, index: number, guess: string) => {
        if (target[index] === char) return 'bg-green-500 text-white border-green-600 scale-105';
        if (target.includes(char)) return 'bg-yellow-500 text-white border-yellow-600';
        return 'bg-slate-400 text-white border-slate-500 opacity-80';
    };

    return (
        <div className="p-4 h-full flex flex-col items-center justify-center gap-4 bg-slate-100/50">
            <div className={`grid gap-2 mb-4 ${shake ? 'animate-shake' : ''}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                        {[...Array(wordLength)].map((_, j) => {
                            const guess = guesses[i];
                            const char = guess ? guess[j] : (i === guesses.length ? input[j] : '');
                            const statusClass = guess ? getCharClass(char, j, guess) : (char ? 'border-slate-400 border-2 scale-105' : 'border-slate-200');
                            return (
                                <div key={j} className={`w-12 h-12 flex items-center justify-center text-xl font-black rounded-xl border-b-4 transition-all duration-500 shadow-sm ${statusClass} ${!guess && !char ? 'bg-white' : ''}`}>
                                    {char}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-[280px] flex gap-2">
                <input
                    type="text"
                    maxLength={wordLength}
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleKey('Enter')}
                    className="flex-1 p-2 rounded-xl border-2 border-slate-200 text-center font-black text-xl tracking-widest uppercase focus:border-blue-500 outline-none shadow-sm"
                    placeholder="TYPE GUESS"
                    disabled={isGameOver}
                />
                <button onClick={() => handleKey('Enter')} disabled={isGameOver || input.length !== wordLength} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all active:scale-95">Enter</button>
            </div>

            {isGameOver && (
                <div className="text-center animate-in fade-in zoom-in slide-in-from-bottom-4 mt-2">
                    <div className={`text-lg font-black mb-4 ${widget.data.wordleStatus === 'won' ? 'text-green-600' : 'text-red-500'}`}>
                        {widget.data.wordleStatus === 'won' ? 'PERFECT! 🎉' : `Word was: ${target}`}
                    </div>
                    <button onClick={resetGame} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Play Again</button>
                </div>
            )}

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Word Length</label>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { wordleSize: s }); resetGame(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${wordLength === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Custom Word (Teacher)</label>
                            <input
                                type="text"
                                placeholder="Enter word..."
                                className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none uppercase font-bold"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.toUpperCase();
                                        if (val.length >= 3 && val.length <= 6) {
                                            updateData(widget.id, { wordleTarget: val, wordleGuesses: [], wordleStatus: 'playing', wordleSize: val.length, showSettings: false });
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const GridGlide = ({ widget, updateData }: any) => {
    const gridSize = widget.data.boggleSize || 4;
    const grid = widget.data.boggleGrid || [];
    const foundWords = widget.data.boggleFound || [];
    const [selection, setSelection] = useState<number[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [message, setMessage] = useState<{ text: string, color: string } | null>(null);

    const generateGrid = () => {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const newGrid: string[] = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const isVowel = Math.random() < 0.3;
            const source = isVowel ? vowels : consonants;
            newGrid.push(source[Math.floor(Math.random() * source.length)]);
        }
        updateData(widget.id, { boggleGrid: newGrid, boggleFound: [] });
        setSelection([]);
    };

    useEffect(() => {
        if (!widget.data.boggleGrid) generateGrid();
    }, [gridSize]);

    const handlePointerDown = (idx: number) => {
        setIsSelecting(true);
        setSelection([idx]);
    };

    const handlePointerEnter = (idx: number) => {
        if (!isSelecting || selection.includes(idx)) return;
        const lastIdx = selection[selection.length - 1];
        const lastRow = Math.floor(lastIdx / gridSize);
        const lastCol = lastIdx % gridSize;
        const currRow = Math.floor(idx / gridSize);
        const currCol = idx % gridSize;

        if (Math.abs(lastRow - currRow) <= 1 && Math.abs(lastCol - currCol) <= 1) {
            setSelection([...selection, idx]);
        }
    };

    const handlePointerUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        const word = selection.map(idx => grid[idx]).join('');

        let isValidWord = false;
        for (const len in WORD_BANKS) {
            if (WORD_BANKS[len as unknown as keyof typeof WORD_BANKS].includes(word)) {
                isValidWord = true;
                break;
            }
        }

        if (word.length < 3) {
            setSelection([]);
            return;
        }

        if (isValidWord && !foundWords.includes(word)) {
            updateData(widget.id, { boggleFound: [...foundWords, word] });
            setMessage({ text: 'Valid!', color: 'text-green-500' });
        } else if (foundWords.includes(word)) {
            setMessage({ text: 'Already found', color: 'text-yellow-500' });
        } else {
            setMessage({ text: 'Not in word bank', color: 'text-slate-400' });
        }
        setTimeout(() => { setMessage(null); setSelection([]); }, 1000);
    };

    return (
        <div className="p-4 h-full flex flex-col items-center gap-4 bg-slate-100/50 overflow-y-auto" onPointerUp={handlePointerUp}>
            <div className="flex justify-between w-full max-w-[280px] mb-2">
                <div className="text-[10px] font-black uppercase text-slate-400">Words: {foundWords.length}</div>
                {message && <div className={`text-[10px] font-black uppercase ${message.color} animate-pulse`}>{message.text}</div>}
            </div>

            <div
                className="grid gap-2 select-none touch-none"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
                {grid.map((char: string, i: number) => (
                    <div
                        key={i}
                        onPointerDown={() => handlePointerDown(i)}
                        onPointerEnter={() => handlePointerEnter(i)}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-black rounded-2xl border-b-4 transition-all duration-100 cursor-pointer shadow-md ${selection.includes(i) ? 'bg-blue-600 text-white border-blue-800 scale-95 shadow-inner' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                        {char}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-[320px] bg-white/50 backdrop-blur rounded-xl p-3 flex flex-wrap gap-2 mt-2">
                {foundWords.length === 0 && <div className="text-[10px] italic text-slate-400 w-full text-center py-2">Swipe letters to find words!</div>}
                {foundWords.map((w: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                        {w}
                    </span>
                ))}
            </div>

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Grid Size</label>
                            <div className="flex gap-2">
                                {[4, 5].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { boggleSize: s }); generateGrid(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${gridSize === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}x{s}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={generateGrid} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                            <RefreshCw size={16} /> New Board
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ScrambleSwap = ({ widget, updateData }: any) => {
    const wordLength = widget.data.scrambleSize || 5;
    const target = widget.data.scrambleTarget || 'APPLE';
    const current = widget.data.scrambleCurrent || [];
    const isSolved = widget.data.scrambleSolved || false;
    const hintedIndices = widget.data.scrambleHints || [];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [shake, setShake] = useState(false);

    const scrambleWord = (word: string) => {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        if (arr.join('') === word && word.length > 1) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        return arr;
    };

    const resetGame = () => {
        const words = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || WORD_BANKS[5];
        const newTarget = words[Math.floor(Math.random() * words.length)];
        updateData(widget.id, {
            scrambleTarget: newTarget,
            scrambleCurrent: scrambleWord(newTarget),
            scrambleSolved: false,
            scrambleHints: []
        });
        setSelectedIndex(null);
        setShake(false);
    };

    const giveHint = () => {
        if (isSolved) return;
        const incorrectIndices = [];
        for (let i = 0; i < target.length; i++) {
            if (current[i] !== target[i]) {
                incorrectIndices.push(i);
            }
        }
        if (incorrectIndices.length === 0) return;

        const targetIndex = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
        const targetChar = target[targetIndex];

        let currentIndex = -1;
        for (let i = 0; i < current.length; i++) {
            if (i !== targetIndex && current[i] === targetChar && current[i] !== target[i]) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex !== -1) {
            const next = [...current];
            [next[targetIndex], next[currentIndex]] = [next[currentIndex], next[targetIndex]];
            updateData(widget.id, {
                scrambleCurrent: next,
                scrambleSolved: next.join('') === target,
                scrambleHints: [...hintedIndices, targetIndex]
            });
            setSelectedIndex(null);
        }
    };

    useEffect(() => {
        if (!widget.data.scrambleTarget) resetGame();
    }, [wordLength]);

    const swap = (i: number, j: number) => {
        const next = [...current];
        [next[i], next[j]] = [next[j], next[i]];
        updateData(widget.id, { scrambleCurrent: next, scrambleSolved: false });
        setSelectedIndex(null);
    };

    const checkWord = () => {
        const word = current.join('');
        const bank = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || [];
        if (word === target || bank.includes(word)) {
            updateData(widget.id, { scrambleSolved: true });
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col items-center justify-center gap-8 bg-slate-100/50 relative overflow-hidden">
            <div className={`flex gap-2 flex-wrap justify-center ${shake ? 'animate-shake' : ''}`}>
                {current.map((char: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (isSolved) return;
                            if (selectedIndex === null) setSelectedIndex(i);
                            else if (selectedIndex === i) setSelectedIndex(null);
                            else swap(selectedIndex, i);
                        }}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-black rounded-2xl border-b-4 transition-all duration-300 shadow-lg ${isSolved ? 'bg-green-500 text-white border-green-600 scale-110' : (hintedIndices.includes(i) && current[i] === target[i] ? 'bg-amber-100 text-amber-700 border-amber-300' : (selectedIndex === i ? 'bg-blue-600 text-white border-blue-800 -translate-y-2' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'))}`}
                    >
                        {char}
                    </button>
                ))}
            </div>

            {!isSolved ? (
                <div className="flex gap-4">
                    <button onClick={giveHint} className="px-5 py-3 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold border-2 border-amber-200 transition-all active:scale-95 flex items-center gap-2" title="Reveal one letter">
                        <Lightbulb size={20} /> Hint
                    </button>
                    <button onClick={checkWord} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-wider">Check Word</button>
                </div>
            ) : (
                <div className="text-center animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <div className="text-green-600 text-lg font-black mb-4 uppercase tracking-[0.2em]">Unscrambled! 🏆</div>
                    <button onClick={resetGame} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">Next Word</button>
                </div>
            )}

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Word Length</label>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { scrambleSize: s }); resetGame(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${wordLength === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={resetGame} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                            <RefreshCw size={16} /> New Word
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const GamesWidget = ({ widget, updateData }: any) => {
    const { activeGame = 'wordle' } = widget.data;

    return (
        <div className="h-full bg-white flex flex-col min-h-0 relative no-drag overflow-hidden">
            <div className="bg-slate-50 p-2 border-b flex items-center justify-between shrink-0 z-20">
                <div className="flex gap-1 items-center bg-slate-200/50 p-1 rounded-xl">
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'wordle' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'wordle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Type size={14} /> LexiGuess
                    </button>
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'boggle' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'boggle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Grid size={14} /> Grid Glide
                    </button>
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'scramble' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'scramble' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <RefreshCw size={14} /> Scramble
                    </button>
                </div>
                <button
                    onClick={() => updateData(widget.id, { showSettings: !widget.data.showSettings })}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                >
                    <Settings size={18} />
                </button>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeGame === 'wordle' && <LexiGuess widget={widget} updateData={updateData} />}
                {activeGame === 'boggle' && <GridGlide widget={widget} updateData={updateData} />}
                {activeGame === 'scramble' && <ScrambleSwap widget={widget} updateData={updateData} />}
            </div>
        </div>
    );
};

export default GamesWidget;

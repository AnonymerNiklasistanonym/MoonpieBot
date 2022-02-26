/*
 * TODO Feature idea: Enable adding and removing commands based on a regex
 */

// TODO: Create DB
//       COMMAND_NAME         REGEX   OUTPUT COUNT           USER_LEVEL              COOLDOWN
//       String               String  String Integer         String                  Integer
//       PK,UNIQUE            ^....$         Number of calls BROAD,VIP,MOD,SUB,EVERY seconds
//       Used to edit/delete

// TODO: Add commands
//       add cmdregex $NAME $REGEX $OUT lvl=$USER_LEVEL cd=$COOLDOWN
//       delete cmdregex $NAME
//       edit cmdregex $NAME $REGEX $OUT lvl=$USER_LEVEL cd=$COOLDOWN
//       list cmdregex (list of all registered names)

// TODO: Output logic
//       - $(count)
//       - $(user)
//       - $(random_num:x:y)
//       - $(twitch_url:name) // User Twitch url
//       - $(twitch_game:name) // Last played twitch game
//       - $(random_chatter)
//       - $(group:1),$(group:2),$(group:3)

const languageRouter = require("./language-router")

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getWordById(db, id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
        )
        .where({ id })
        .first()
  },

  updateWordById(db, id, updatedWord){       
    return db
      .from('word')
      .where({id})      
      .update(updatedWord)
  },

  async updateDatabaseWithWordsAndHead(db,LinkedList,language_id){    
    let currentWord = LinkedList.head
    while(currentWord !== null){
      
      await this.updateWordById(db,currentWord.value.id,currentWord.value)
      currentWord = currentWord.next
    }
    
    currentWord = LinkedList.head    
    await db
      .from('language')
      .where({ id : language_id })
      .update({head: currentWord.value.id})
  },

  populateLinkedListWithWords(words,LinkedList, head_id){
    
    let next_id = head_id    
    while(next_id !== null){
      let targetNode = words.find(word => word.id === next_id)      
      LinkedList.add(targetNode)
      next_id = targetNode.next
    }
  },

  updateNextInLLValues (LinkedList){
    let currentWord = LinkedList.head
    while(currentWord.next !== null){
      currentWord.value.next = currentWord.next.value.id
      currentWord = currentWord.next
    }
  }
}

module.exports = LanguageService

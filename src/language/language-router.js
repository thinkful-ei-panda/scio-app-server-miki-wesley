const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

class _Node {
  constructor(value,next){
    this.value = value;
    this.next = next;    
  }
}

class LinkedList {
  constructor(){
    this.head = null
    this.last = null
  }

  add (item) {
    let newNode = new _Node(item,null)

    if(this.head === null) {      
      this.head = newNode
      this.last = newNode
    } else {
      this.last.next = newNode
      this.last = newNode
    }
  }

  remove(item){
    if(this.head === null){
      throw new Error('Empty Linked List')
    }

    let currentNode = this.head
    let previousNode = this.head
    while(currentNode.value !== item){
      if(currentNode === null)
        throw new Error('Could not find item to be deleted')
      previousNode = currentNode
      currentNode = currentNode.next
    }

    previousNode.next = currentNode.next
    currentNode = null
  }

  update(item){    
    if(this.head === null){
      throw new Error('Empty Linked List')
    }

    let currentNode = this.head    
    while(currentNode.value.id !== item.id){
      if(currentNode === null)
        throw new Error('Could not find item to be deleted')      
      currentNode = currentNode.next
    }

    currentNode.value = item
  }

  moveWordNode(item){
    if(this.head === null){
      throw new Error('Empty Linked List')
    }

    let currentNode = this.head
    let previousNode = this.head
    while(currentNode.value.id !== item.id){
      if(currentNode === null)
        throw new Error('Could not find item to be deleted')      
      previousNode = currentNode
      currentNode = currentNode.next
    }

    this.head = currentNode.next
    let stepsRemaining = item.memory_value    

    while(stepsRemaining > 0 && currentNode.next !== null){
      //save current.next to set as previous
      const newPrevious = currentNode.next      
      
      if(previousNode === currentNode){        
        currentNode.next = currentNode.next.next
        this.head.next = currentNode
      } else {      
        //1 previous, 2 current, 3 current.next, 4 current.next.next

        //save 4th temporarily
        let fourthNode = currentNode.next.next

        //set 1.next as 3
        previousNode.next = currentNode.next

        //set 3.next as 2
        currentNode.next.next = currentNode

        //set 2.next as 4
        currentNode.next = fourthNode
      }      

      previousNode = newPrevious
      stepsRemaining--         
    }

    if(currentNode.next === null){
      this.last = currentNode
    }
  }

  display(){
    let currentNode = this.head
    while(currentNode !== null) {
      console.log(currentNode.value)
      currentNode = currentNode.next
    }
  }
}

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {    
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {    
    let {language} = req    
    try {      
      const headWord = await LanguageService.getWordById(
        req.app.get('db'),
        req.language.head,
      )

      const nextWordResponse = {
        nextWord: headWord.original,
        totalScore: language.total_score,
        wordCorrectCount: headWord.correct_count,
        wordIncorrectCount: headWord.incorrect_count,
      }

      res.status(200).json(nextWordResponse)
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', express.json(), async (req, res, next) => {        
    
    const {guess} = req.body
    let language = req.language

    if(!guess) {
      return res.status(400).json({ error: "Missing 'guess' in request body" })
    }

    try{
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        language.id
      )

      const headWord = await LanguageService.getWordById(
        req.app.get('db'),
        language.head,
      )

      //create linked list and populate it with the words in their current order
      let wordsList = new LinkedList
      LanguageService.populateLinkedListWithWords(words, wordsList, headWord.id)

      //initialize response with values from headWord and wordsList
      const answer = headWord.translation,
        nextWord = wordsList.head.next.value.original,
        wordCorrectCount = wordsList.head.next.value.correct_count
        wordIncorrectCount = wordsList.head.next.value.incorrect_count
      let response = {
        answer,
        isCorrect: null,
        nextWord,
        totalScore: language.total_score,
        wordCorrectCount,
        wordIncorrectCount,
      }   
      
      //checks if guess matches answer
      if(guess.toLowerCase() !== headWord.translation.toLowerCase()){
        headWord.incorrect_count++;
        headWord.memory_value=1;
        response.isCorrect = false;        
      } else {
        headWord.correct_count++;
        headWord.memory_value=headWord.memory_value*2  
        response.isCorrect = true;  
        response.totalScore++;
        language.total_score++;
      }

      //update wordList with new values, order, and next pointers
      //update response with values      
      wordsList.update(headWord)      

      wordsList.moveWordNode(headWord)
      
      LanguageService.updateNextInLLValues(wordsList)      

      //update database with new words list
      //update database with new language head
      await LanguageService.updateDatabaseWithWordsHeadAndScore(
        req.app.get('db'),
        wordsList,
        language
      )

      //send response to client
      res.status(200).json(response)
      next()      
    } catch (error) {
      next()
    }
  })

module.exports = languageRouter

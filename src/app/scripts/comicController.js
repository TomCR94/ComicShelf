(function () {
  'use strict'
  const comics = require('./plugins/electron-json-comics/src/index.js')
  const collections = require('./plugins/electron-json-collections/src/index.js')
  const config = require('electron-json-config')
  const fs = require('fs')
  const filewatcher = require('filewatcher')
  const watcher = filewatcher()
  const FileHound = require('filehound')
  const download = require('image-downloader')
  const electron = require('electron')
  const http = require('http')
  const dataPath = (electron.app || electron.remote.app).getPath('userData')

  var _assetBase = 'app/assets'

  angular.module('app')
        .controller('comicController', ['comicService', '$q', '$mdDialog', comicController])

  function comicController (comicService, $q, $mdDialog) {
    var self = this

    self.selected = null
    self.combinedGames = []
    self.games = []
    self.steamGames = []
    self.selectedIndex = 0
    self.filterText = null
    self.selectGame = selectGame
    self.reloadGames = reloadGames
    
        // Load initial data
    getAllGames()
        // File watcher
    watcher.add(comics.file())
    watcher.on('change', function (file, stat) {
      reloadGames()
    })
        // ----------------------
        // Internal functions
        // ----------------------
    function reloadGames () {
      self.games = comicService.getAllComics()
      self.combinedGames = self.steamGames.concat(self.games)
    }

    function selectGame (comicService, index) {
      self.selected = angular.isNumber(comicService) ? self.games[comicService] : comicService
      self.selectedIndex = angular.isNumber(comicService) ? comicService : index
    }

    function getAllGames () {
      self.games = [].concat(comicService.getAllComics())
      self.combinedGames = [].concat(self.games)
      self.selected = self.games[0]
    }
  }
})()

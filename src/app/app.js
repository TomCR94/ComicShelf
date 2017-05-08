(function () {
  'use strict'
  const open = require('open')
  const electron = require('electron')
  const remote = electron.remote
  const app = (electron.app || remote.app)
  const config = require('electron-json-config')
  const comics = require('./plugins/electron-json-comics/src/index.js')
  const download = require('image-downloader')
  const spawn = require('child_process').spawn
  const fs = require('fs')
  const dataPath = app.getPath('userData')
  const FileHound = require('filehound')

  var _templateBase = 'app/template'
  var _assetBase = 'app/assets'

  angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'ngAnimate',
    'ngSanitize'
  ])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: _templateBase + '/game.html',
        controller: 'comicController',
        controllerAs: '_ctrl'
      })
      $routeProvider.otherwise({ redirectTo: '/' })
    }
    ])
    .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('orange')
    .accentPalette('grey', {
      'default': '600', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    })
    })
    .controller('MainCtrl', function ($scope, $mdDialog, $q) {
    var tabs = [
          { title: 'All',desc: "All Comics", filter: ''}
    ]
    $scope.tabs = tabs
      $scope.openGameInfoDialog = function (obj) {
        $mdDialog.show({
          locals: {dataToPass: obj},
          controller: mdOpenGameDialogCtrl,
          templateUrl: _templateBase + '/gameInfoDialog.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true,
          fullscreen: $scope.customFullscreen
        })
      }
      $scope.openAddGameDialog = function () {
        $mdDialog.show({
          controller: mdAddGameDialogCtrl,
          templateUrl: _templateBase + '/addGameDialog.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true,
          fullscreen: $scope.customFullscreen
        })
      }
      var openGameSettingsDialog = function (obj) {
          $mdDialog.show({
            locals: {dataToPass: obj},
            controller: mdGameSettingsDialogCtrl,
            templateUrl: _templateBase + '/gameSettingsDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen
          })
        }
        $scope.openAppSettingsDialog = function () {
          $mdDialog.show({
            controller: mdAppSettingsDialogCtrl,
            templateUrl: _templateBase + '/appSettingsDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen
          })
        }
        $scope.openAddCollectionsDialog = function () {
          $mdDialog.show({
            controller: mdCollectionsCtrl,
            templateUrl: _templateBase + '/addCollectionDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen
          })
        }
        $scope.openViewCollectionsDialog = function () {
          $mdDialog.show({
            controller: mdCollectionsCtrl,
            templateUrl: _templateBase + '/viewCollectionDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen
          })
        }

      $scope.openURL = function (URL) {
        open(URL)
      }

      $scope.quit = function () {
        app.quit()
      }

      $scope.minimise = function () {
        remote.getCurrentWindow().minimize()
      }

      var runApp = function (game) {
          var alert = $mdDialog.confirm({
            clickOutsideToClose: true,
            title: 'Attention',
            textContent: 'This comic is not set up!',
            ok: 'Close',
            cancel: 'Settings'
          })
          $mdDialog
        .show(alert)
        .then(function() {}, function() {
        openGameSettingsDialog(game)
        });
          return false
      }

      $scope.runApp = function (game) {
        runApp(game)
      }

  // Dialog Controllers
      var mdOpenGameDialogCtrl = function ($scope, dataToPass) {
        $scope.mdDialogData = dataToPass
        $scope.htmlData = dataToPass.Overview

        $scope.hide = function () {
          $mdDialog.hide()
        }

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.open = function (obj) {
          open(obj.url)
          $scope.cancel()
        }

        $scope.runApp = function (game) {
          $scope.cancel()
          runApp(game)
        }

        $scope.removeGame = function (id) {
          $scope.cancel()
          if (comics.has(id.toString())) { comics.delete(id.toString()) }
          fs.exists(dataPath + '\\headerImages\\' + id + '.jpg', function (doesExist) {
            if(doesExist)
              fs.unlink(dataPath + '\\headerImages\\' + id + '.jpg')
          })
        }
        $scope.openGameSettingsDialog = function(game){
          openGameSettingsDialog(game)
        }

      $scope.checkImageSource = function checkImageSource (src, id) {
      var deferred = $q.defer()
      if (src) {
        if (fs.existsSync(dataPath + '\\headerImages\\' + id + '.jpg')) {
          return dataPath + '\\headerImages\\' + id + '.jpg'
        } else {
          $scope.getImageLocal(src, id)
      .then(function (path) {
        return src
      })
        }
      }
      return _assetBase + '/loading.jpg'
    }

     $scope.getImageLocal = function getImageLocal (src, id) {
      var deferred = $q.defer()
      if (!fs.existsSync(dataPath + '\\headerImages\\')) {
        fs.mkdirSync(dataPath + '\\headerImages\\')
      }

      fs.exists(dataPath + '\\headerImages\\' + id + '.jpg', function (doesExist) {
        if (doesExist) { deferred.resolve(dataPath + '\\headerImages\\' + id + '.jpg') } else {
          var options = {
            url: src,
            dest: dataPath + '\\headerImages\\' + id + '.jpg'                 // Save to /path/to/dest/image.jpg
          }
          download.image(options)
          .then(({ filename, image }) => {
            deferred.resolve(dataPath + '\\headerImages\\' + id + '.jpg')
          }).catch((err) => {
            deferred.reject('No saved Image')
            throw err
          })
        }
      })
      return deferred.promise
    }
    $scope.openGameSettingsDialog = function (obj) {
      openGameSettingsDialog(obj)
    }
      }

      var mdCollectionsCtrl = function ($scope) {
        $scope.newCollection = {
          field: '',
          filter: '',
          text: '',
          title: '',
          desc: ''
        }

        $scope.addCollecion = function () {
          $scope.newCollection.desc = $scope.newCollection.field + ' ' + $scope.newCollection.filter + ' ' + $scope.newCollection.text
          if($scope.newCollection.field === 'Name')
          {
            if($scope.newCollection.filter === 'Is Equal To')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.name && passed.name === $scope.newCollection.text) return true; return false }})
            }
            else if($scope.newCollection.filter === 'Is Not Equal To')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.name && passed.name !== $scope.newCollection.text) return true; return false }})
            }
            else if($scope.newCollection.filter === 'Contains')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.name && passed.name.indexOf($scope.newCollection.text) > -1) return true; return false }})
            }
            else
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.name && passed.name.indexOf($scope.newCollection.text) === -1) return true; return false }})
            }
          }
          else
          {
            if($scope.newCollection.filter === 'Is Equal To')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.publisher && passed.publisher === $scope.newCollection.text) return true; return false }})
            }
            else if($scope.newCollection.filter === 'Is Not Equal To')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.publisher && passed.publisher !== $scope.newCollection.text) return true; return false }})
            }
            else if($scope.newCollection.filter === 'Contains')
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.publisher && passed.publisher.indexOf($scope.newCollection.text) > -1) return true; return false }})
            }
            else
            {
              tabs.push({ title: $scope.newCollection.title,desc: $scope.newCollection.desc, filter: function (passed) { if (passed.publisher && passed.publisher.indexOf($scope.newCollection.text) === -1) return true; return false }})
            }
          }
        }

        $scope.hide = function () {
          $mdDialog.hide()
        }

        $scope.cancel = function () {
          $mdDialog.cancel()
        }
        $scope.tabs = tabs

        $scope.delete = function (tab) 
        {
          console.log(tab)
          tabs.splice(tabs.indexOf(tab))
          console.log(tabs)
        }
      }

      var mdAppSettingsDialogCtrl = function ($scope) {
        
        $scope.useSteam = config.get('useSteam', false)
        $scope.fileLocation = config.get('steamDirectory', '')
        
        $scope.toggleUseSteam = function () {
          $scope.useSteam = !$scope.useSteam
        }

        $scope.hide = function () {
          $mdDialog.hide()
        }

        $scope.setFileLocation = function (loc) {
          if(loc)
          {
            $scope.fileLocation = loc.files[0].path.substring(0,loc.files[0].path.lastIndexOf("\\"))
            $scope.$apply()
          }
        }

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.apply = function () {
          if($scope.useSteam)
          {
            if(validSteamDirectory($scope.fileLocation))
            {
              config.set('steamDirectory', $scope.fileLocation)
              config.set('useSteam', $scope.useSteam)
            }
            else
            {
              var alert = $mdDialog.alert({
              clickOutsideToClose: true,
              title: 'Attention',
              textContent: 'This directory does not contain  Steam.exe!',
              cancel: 'Settings'
          })
          $mdDialog.show(alert)
          }
        }
        else
              config.set('useSteam', $scope.useSteam)
        }
      }

      var mdGameSettingsDialogCtrl = function ($scope, dataToPass) {
        $scope.mdDialogData = dataToPass
        $scope.htmlData = dataToPass.Overview
        $scope.environments = [{name: 'PC', location: '', arguements: []}, {name: '3DS', location: '', arguements: []}, {name: 'Wii U', location: 'E:\\Tom\\Documents\\cemu_1.7.0\\Cemu.exe', arguements: ['-f', '-g']}]
        $scope.environment = (dataToPass.environment || '')
        $scope.fileLocation = (dataToPass.fileLocation || '')
        $scope.NewGameData = JSON.parse(JSON.stringify(dataToPass))
        $scope.hide = function () {
          $mdDialog.hide()
        }

        $scope.cancel = function () {
          $mdDialog.cancel()
        }

        $scope.setEnvironment = function (env) {
          $scope.environment = env
        }

        $scope.setFileLocation = function (loc) {
          if(loc)
          {
            $scope.fileLocation = loc.files[0].path
            $scope.$apply()
          }
        }

        $scope.open = function (obj) {
          open(obj.URL)
          $scope.cancel()
        }

        $scope.apply = function () {
          $scope.NewGameData.environment = $scope.environment
          $scope.NewGameData.fileLocation = $scope.fileLocation
          comics.set($scope.mdDialogData.id.toString(), $scope.NewGameData)
        }
      }

      var mdAddGameDialogCtrl = function ($scope) {
        $scope.error
        $scope.resultText
        $scope.newGame = {
          name: '',
          developer: '',
          publisher: '',
          genre: ''
        }

        $scope.useFilters = false
        $scope.resultGames = []

        $scope.hide = function () {
          $mdDialog.hide()
        }

        $scope.cancel = function () {
          $mdDialog.cancel()
        }
        $scope.toggleUseFilters = function () {
          $scope.useFilters = !$scope.useFilters
        }
        $scope.searchGames = function (newGameObj) {
          $scope.resultText = 'Searching...'
          $scope.error = ''
          $scope.resultGames = []
          $scope.selectedGame = null

          $scope.gameDetails = null
          angular.element(document.body).injector().get('comicService').getForName(newGameObj.name).then(function (comics) {
            if (comics.length > 0) {
              $scope.resultText = 'Result'
              $scope.error = ''
              $scope.resultGames = comics
            } else {
              $scope.resultText = 'Result'
              $scope.error = 'No Games Found'
            }
          })
        }

        $scope.searchGamesWithFilters = function(newGameObj)
        {
          $scope.resultText = 'Searching...'
          $scope.resultGames = []
          $scope.selectedGame = null

          $scope.gameDetails = null
          angular.element(document.body).injector().get('comicService').searchForCompany(newGameObj.developer).then(function (developers) {
              angular.element(document.body).injector().get('comicService').searchForCompany(newGameObj.publisher).then(function (publishers) {
                angular.element(document.body).injector().get('comicService').searchForGenre(newGameObj.genre).then(function (genres) {
                  angular.element(document.body).injector().get('comicService').getForNameAndOthers(newGameObj.name, developers, publishers, genres).then(function (comics) {
                    if (comics.length > 0) {
                      $scope.resultText = 'Result'
                      $scope.error = ''
                      $scope.resultGames = comics
                    } else {
                      $scope.resultText = 'Result'
                      $scope.error = 'No Games Found'
                    }
          })
            })
          })
          })
          
          
        }

        $scope.changed = function () {
            $scope.gameDetails = $scope.selectedGame
        }

        $scope.addComic = function (comic) {
          if (!comics.has(comic.id.toString())) { comics.set(comic.id.toString(), comic) }
        }
      }
    })
})()

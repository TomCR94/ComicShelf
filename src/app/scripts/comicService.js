(function () {
  'use strict'
  const comics = require('./plugins/electron-json-comics/src/index.js')
  const collections = require('./plugins/electron-json-collections/src/index.js')
  const config = require('electron-json-config')
  const unirest = require('unirest')
  const FileHound = require('filehound')
  const vdf = require('simple-vdf')
  const download = require('image-downloader')
  const fs = require('fs')

  angular.module('app')
        .service('comicService', ['$q', comicService])
        

  function comicService ($q) {
    return {
      getForName: getForName,
      getAllComics: getComics,
      addComicToFile: addComicToFile
    }

    function getComics () {
      var comicArr = []
      for (var key in comics.all()) {
            // skip loop if the property is from prototype
        if (!comics.all().hasOwnProperty(key)) continue

        var obj = comics.all()[key]
        comicArr.push(obj)
      }
      return comicArr
    }

    function addComicToFile (comic) {
      if (!comics.has(comic.id.toString())) { comics.set(comic.id.toString(), comic) }
    }

    function getForName (name) {
      var deferred = $q.defer()
      var childObj

      unirest.get('http://api.comicvine.com/search/?api_key=d8503d452a18b4d3885bbd3ef152525540e1b3c0&resources=volume&query=' + name + '&limit=20&format=json')
            .header('User-Agent', 'ComicShelf')
            .end(function (result) {
              console.log(result.body)
              var obj = []
              result.body.results.forEach(function (element) {
                childObj = {
                  name: element.aliases ? element.aliases : element.name,
                  id: element.id,
                  description: angular.element(element.description).text(),
                  image: element.image.medium_url,
                  publisher: element.publisher.name,
                  ReleaseDate: element.start_year,
                  url: element.site_detail_url
                }

                obj.push(childObj)
              }, this)
              deferred.resolve(obj)
            })
      return deferred.promise
    }
  }
})()

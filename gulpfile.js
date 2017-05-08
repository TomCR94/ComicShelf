var gulp = require('gulp'),
  childProcess = require('child_process'),
  electron = require('electron'),
  packager = require('electron-packager'),
  winInstaller = require('electron-windows-installer');
 
gulp.task('create-windows-installer', function(done) {
  winInstaller({
    appDirectory: './Build/GameShelf-win32-x64',
    arch: 'ia32'
  }).then(done).catch(done);
});

gulp.task('run', function() {
  childProcess.spawn(electron, ['./'])
})

gulp.task('build', function () {
  //electron-packager ./ GameShelf --asar --Windows --out ./Build --electron-version 1.6.2 --overwrite
  packager({dir: './',
            platform: 'all', 
            asar: true,
            out: './Build',
            electronVersion: '1.6.2',
            overwrite: true}, function(err, path){
  })
})
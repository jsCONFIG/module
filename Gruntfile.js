module.exports = function(grunt) {
  // 遍历page业务层下的所有目录，获取文件名称，用于合并
  var files = {};

  // 读取需要打包的文件，判断依赖，拉取concat
  // grunt task --filepath=main.js
  var filePath = grunt.option( 'filepath' ) || '';

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

  /**
   * 单个文件默认会打包到该文件所在的目录下，
   * 名称默认为:打包文件名+"-bmodule.js"
   * 批量文件打包时，默认会在rootDir下，新建一个bmodule目录
   * bmodule目录中按照打包目录结构存储同名打包压缩后的文件
   * @param  {[type]} filepath 欲打包的文件地址，或文件目录
   * @param  {[type]} target   欲存储的文件地址，或文件目录前缀(可选)
   * @param  {[type]} prefix   bmodule中,通过$M.options('sourceRoot', 'static/js/');设置的文件前缀
   * @param  {number} isUglify 是否进行压缩，默认为是,取0关1开
   * @return {[type]}          [description]
   */
  grunt.registerTask('bmodule', 'Commpress tools for bmodulejs.', function ( filepath, target, prefix, isUglify ) {
    if( !filepath ) {
      grunt.fatal(this.name + ' need a file path as first parameter!')
    }
    else {
      isUglify = (typeof isUglify == 'undefined') ? true : isUglify;
      prefix = prefix || '';
      var hasWrittenList = [];
      // 解析文件内容，返回解析后打包的内容
      var readFile = function ( fileContent ) {
        var matchReg = /\.require\(([^\,\)]+)(\,([^\)]*))?\)/g;
        var pathReg = /\(([^\,\)]+)(\,([^\)]*))?\)/;
        var matchArr = fileContent.match( matchReg );
        var contents = '';
        if( matchArr ) {
          matchArr.forEach(function ( item, index ) {
            var file;
            var matchResult = item.match( pathReg );
            if( matchResult[2] ) {
              file = prefix + matchResult[2];
            }
            else {
              file = matchResult[1].replace(/\./g,'/') + '.js';
              file = prefix + file.replace( /[\'\"\s]/g, '' );
            }
            // 以前没打包过才进行打包，防止同个文件
            // 多处引用导致的重复打包
            if( hasWrittenList.indexOf( file ) == -1 ) {
              var childContent = grunt.file.read(file , {'encoding': 'utf-8'});
              contents += readFile( childContent ) + ';\n';
              hasWrittenList.push( file );
            }
          });
          contents += fileContent;
        }
        else {
          contents = fileContent;
        }
        return contents;
      };
      // 未匹配到.js后缀表示传入为目录，
      // 对该目录下的所有js文件打包
      if( !/^.+\.js$/.test( filepath ) ) {
        var ugliFiles = {};
        // 在指定路径写入内容打包内容
        // 此处，写入路径和读取源路径传入为同一个地址
        var writeFile = function ( filePath ) {
          var fileContent = grunt.file.read(filePath , {'encoding': 'utf-8'});
          // var openCodePackage = 'if($M && $M.options ){$M.options("codePackage", true);}\n';
          var openCodePackage = '';
          targetPath = (target || 'bmodule/') + filePath;

          ugliFiles[ targetPath ] = targetPath;
          grunt.file.write( targetPath, openCodePackage + readFile(fileContent) + ';\n');
        };

        // 遍历文件目录，创建处理后的镜像文件在rootdir目录下的bmodule文件夹中
        grunt.file.recurse( filepath, function (abspath, rootdir, subdir, filename) {
          // 当前文件的完整路径
          // 由 rootdir + subdir + filename 三部分组成
          // abspath
          // 根目录
          // rootdir
          // 当前文件所在目录，相对于根目录
          // subdir
          // 当前文件的文件名，不含目录部分
          // filenam
          grunt.log.writeln( filename );

          // 判断是js文件才进行处理
          if( /^.+\.js$/.test( filename ) ) {
            // 每次使用时都更新
            hasWrittenList = [];
            writeFile(abspath);
          }
        } );
        // 压缩处理
        grunt.initConfig({
          pkg: grunt.file.readJSON('package.json'),
          uglify: {
            'test' : {
              files : ugliFiles
            }
          }
        });
        (isUglify!=0) && grunt.task.run('default');
      }
      else {
        hasWrittenList = [];
        var fileContent = grunt.file.read(filepath , {'encoding': 'utf-8'});

        var ugliFiles = {};
        // 在指定路径写入内容打包内容
        var writeFile = function ( filePath ) {
          // var openCodePackage = 'if($M && $M.options ){$M.options("codePackage", true);}\n';
          var openCodePackage = '';
          var targetPath;
          if( filePath.indexOf('/') == -1 ) {
            targetPath = filePath +'-bmodule.js'
          }
          else {
            var fileName = filePath.slice( filePath.lastIndexOf( '/' ) );
            targetPath = target || (filePath.slice( 0, filePath.lastIndexOf( '/' ) ) + '/' + fileName + '-bmodule.js');
          }
          var targetMinPath = targetPath.slice( 0, targetPath.lastIndexOf( '.js' ) ) + '.min.js';
          ugliFiles[ targetMinPath ] = targetPath;
          grunt.file.write( targetPath, openCodePackage + readFile(fileContent) + ';\n');
        };
        writeFile( filepath );

        // 压缩处理
        grunt.initConfig({
          pkg: grunt.file.readJSON('package.json'),
          uglify: {
            'test' : {
              files : ugliFiles
            }
          }
        });
        (isUglify!=0) && grunt.task.run('default');
      }
    }
  });

};
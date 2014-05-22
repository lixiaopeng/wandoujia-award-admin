/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 18:29:11
* @Last Modified by:   hanjiyun
* @Last Modified time: 2014-05-22 21:31:54
*/

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

var lrSnippet = require('connect-livereload')();
var rewriteRulesSnippet = require('grunt-connect-rewrite/lib/utils').rewriteRequest;

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // grunt.loadNpmTasks('grunt-contrib-compass');
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-manifest');

    // configurable paths
    var pathConfig = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp',
        test : 'test'
    };

    grunt.initConfig({
        paths : pathConfig,

        watch : {
            compass : {
                files : ['<%= paths.app %>/src/stylesheets/{,*/}*/{,*/}*.{scss,sass,png,ttf}'],
                tasks : ['compass:dist']
            },
            // stencil : {
            //     files : ['<%= paths.app %>/**/*.html'],
            //     tasks : ['stencil:server'],
            //     options : {
            //         spawn : false
            //     }
            // },
            statics : {
                files : ['<%= paths.app %>/src/assets/*.*'],
                tasks : ['copy:server'],
                options : {
                    spawn : false
                }
            },
            livereload: {
                files: [
                    '<%= paths.app %>/routes/*.js',
                    '<%= paths.app %>/src/images/*.*',
                    '<%= paths.app %>/src/stylesheets/*.css',
                    '<%= paths.app %>/src/stylesheets/**/*.css',
                    '<%= paths.app %>/src/javascripts/**/*.css',
                    '<%= paths.app %>/views/*.jade'
                ],
                options : {
                    livereload : true,
                    spawn : false
                }
            }
        },

        connect : {
            options : {
                port : 3001,
                hostname : '0.0.0.0'
            },

            server : {
                options : {
                    middleware : function (connect) {
                        return [
                            lrSnippet,
                            rewriteRulesSnippet,
                            mountFolder(connect, pathConfig.tmp),
                            mountFolder(connect, pathConfig.app)
                        ];
                    }
                }
            }
        },

        clean : {
            // dist : ['<%= paths.app %>/css', '<%= paths.app %>/js'],
            server : {
                src : ['<%= paths.app %>/public/css', '<%= paths.app %>/public/img', '<%= paths.app %>/public/js']
            }
        },

        copy : {
            server : {
                files : [{
                    expand : true,
                    dot : true,
                    cwd : '<%= paths.app %>/src/images',
                    dest : '<%= paths.app %>/public/img',
                    src : [
                        '**/*.*'
                    ]
                }]
            },
        },

        concurrent: {
            server : ['copy:server', 'compass:dist'],
            // staging : ['copy:dist', 'compass:staging', 'copy:statics', 'copy:oldStyles', 'copy:js'],
            // dist : ['copy:dist', 'compass:dist', 'copy:js']
        },


        compass : { // Task
            // server : { // eneratedImages
            //     options : {
            //         generatedImagesDir : '<%= paths.app %>/public/img',
            //         debugInfo : true
            //     }
            // },

            dist: { // Target
                options: { // Target options
                    sassDir: '<%= paths.app %>/src/stylesheets',
                    cssDir: '<%= paths.app %>/public/css'
                }
            }
        },


        jshint: {
            all: ['src/**/*.js'],
            test : ['<%= paths.app %>/src/javascripts/**/*.js']
        },

        // uglify: {
        //     options: {
        //         beautify: true,
        //         stats: true,
        //         report: 'min'
        //     },
        //     my_target: {
        //         files: {
        //             'public/js/scripts.min.js': '<%= concat.dist.dest %>'
        //         }
        //     }
        // },

        // concat: {
        //     options: {
        //         separator: ';'
        //     },
        //     dist: {
        //         src: ['src/scripts/plugins.js', 'src/scripts/main.js'],
        //         dest: 'public/js/scripts.js'
        //     }
        // },

        // manifest: {
        //     generate: {
        //         options: {
        //             basePath: 'public/',
        //             preferOnline: true,
        //             verbose: true,
        //             timestamp: true
        //         },
        //         src: [
        //             '**'
        //         ],
        //         dest: 'public/manifest.appcache'
        //     }
        // },

    });


    grunt.registerTask('server', [
        'clean:server',
        'concurrent:server',
        'configureRewriteRules',
        'connect:server',
        // 'stencil:server',
        // 'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'jshint:test'
    ]);

    grunt.registerTask('dev', [
        'compass',
        'jshint',
        'concat',
        'uglify',
        'manifest'
    ]);

};

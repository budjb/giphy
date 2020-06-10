package com.budjb.hegiphy

import org.apache.catalina.realm.GenericPrincipal
import spock.lang.Specification
import org.springframework.http.ResponseEntity

import java.security.Principal

class FavoritesControllerSpec extends Specification {
    FavoriteRepository favoriteRepository
    FavoritesController favoritesController

    def setup() {
        this.favoriteRepository = Mock(FavoriteRepository)
        this.favoritesController = new FavoritesController(favoriteRepository)
    }

    def 'When a list of favorites is requested without a tag filter, all favorites for the logged in user are returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])
        List data = [
            [
                id  : '1',
                user: 'user',
                tags: ['foo']
            ],
            [
                id  : '2',
                user: 'user',
                tags: ['bar']
            ],
            [
                id  : '3',
                user: 'user',
                tags: ['foo', 'bar']
            ],
        ]

        favoriteRepository.findAllByUser('user') >> data

        when:
        def result = favoritesController.list(null, principal)

        then:
        result == data
    }

    def 'When a list of favorites is requested with a tag filter, all favorites for the logged in user with the tag are returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        favoriteRepository.findAllByUserAndTagsContains('user', 'foo') >> [
            [
                id  : '1',
                user: 'user',
                tags: ['foo']
            ],
            [
                id  : '3',
                user: 'user',
                tags: ['foo', 'bar']
            ],
        ]

        when:
        def result = favoritesController.list('foo', principal)

        then:
        result == [
            [
                id  : '1',
                user: 'user',
                tags: ['foo']
            ],
            [
                id  : '3',
                user: 'user',
                tags: ['foo', 'bar']
            ]
        ]
    }

    def 'When a specific favorite is requested and it exists, it is returned with HTTP 200.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        Favorite favorite = [
            id  : '1',
            user: 'user',
            giphyId: 'foo',
            tags: ['foo']
        ] as Favorite

        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.of(favorite)

        when:
        ResponseEntity result = favoritesController.get('foo', principal)

        then:
        result.statusCodeValue == 200
        result.body.is favorite
    }

    def 'When a specific favorite is requested and it does not exist, HTTP 404 is returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])
        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.empty()

        when:
        ResponseEntity result = favoritesController.get('foo', principal)

        then:
        result.statusCodeValue == 404
        result.body.is null
    }

    def 'When a specific favorite is deleted and it exists, it is deleted with HTTP 204.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        Favorite favorite = [
            id  : '1',
            user: 'user',
            giphyId: 'foo',
            tags: ['foo']
        ] as Favorite

        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.of(favorite)

        when:
        ResponseEntity result = favoritesController.delete('foo', principal)

        then:
        1 * favoriteRepository.delete(favorite)
        result.statusCodeValue == 204
        result.body.is null
    }

    def 'When a specific favorite is deleted and it does not exist, HTTP 404 is returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.empty()

        when:
        ResponseEntity result = favoritesController.delete('foo', principal)

        then:
        0 * favoriteRepository.delete(_)
        result.statusCodeValue == 404
        result.body.is null
    }

    def 'When a favorite is added, it gets created in the database and is returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        Favorite favorite = [
            'user': 'bar',
            'giphyImageId': 'imageid'
        ] as Favorite

        when:
        Favorite result = favoritesController.add(favorite, principal)

        then:
        1 * favoriteRepository.save(favorite) >> favorite
        result.is favorite
        favorite.user == 'user'
    }

    def 'When a tag is added to a specific favorite that exists, it is returned with HTTP 200.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        Favorite favorite = [
            id  : '1',
            user: 'user',
            giphyId: 'foo',
            tags: ['']
        ] as Favorite

        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.of(favorite)

        when:
        ResponseEntity result = favoritesController.addTag('foo', 'bar', principal)

        then:
        result.statusCodeValue == 200
        result.body.tags.contains('bar')
    }

    def 'When a tag is added to a specific favorite that does not exist, HTTP 404 is returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])
        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.empty()

        when:
        ResponseEntity result = favoritesController.addTag('foo', 'bar', principal)

        then:
        result.statusCodeValue == 404
        result.body.is null
    }

    def 'When a tag is removed from a specific favorite that exists, it is returned with HTTP 200.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])

        Favorite favorite = [
            id  : '1',
            user: 'user',
            giphyId: 'foo',
            tags: ['bar']
        ] as Favorite

        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.of(favorite)

        when:
        ResponseEntity result = favoritesController.deleteTag('foo', 'bar', principal)

        then:
        result.statusCodeValue == 200
        !result.body.tags.contains('bar')
    }

    def 'When a tag is removed from a specific favorite that does not exist, HTTP 404 is returned.'() {
        setup:
        Principal principal = new GenericPrincipal('user', 'pass', [])
        favoriteRepository.findByGiphyIdAndUser('foo', 'user') >> Optional.empty()

        when:
        ResponseEntity result = favoritesController.deleteTag('foo', 'bar', principal)

        then:
        result.statusCodeValue == 404
        result.body.is null
    }}

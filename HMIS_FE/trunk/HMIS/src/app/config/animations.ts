import { trigger, transition, animate, style, state, group } from '@angular/animations';

// -- Fade In and Out Animation
export const fadeInOut = trigger('fadeInOut', [
    state('void', style({
        opacity: 0
    })),
    transition('void <=> *', animate(50)),
]);

// -- For slide in and out
export const slideInOut = trigger('slideInOut', [
    state('in', style({
        transform: 'translate3d(0,0,0)'
    })),
    state('out', style({
        transform: 'translate3d(103%, 0, 0)'
    })),
    transition('in => out', animate('400ms ease-in-out')),
    transition('out => in', animate('400ms ease-in-out'))
]);

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'width': '50%', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'width': '0px', 'opacity': '0', 'visibility': 'hidden'
        })),
        transition('in => out', [group([
            animate('500ms ease-in-out', style({
                'opacity': '0'
            })),
            animate('500ms ease-in-out', style({
                'width': '0px'
            })),
            animate('500ms ease-in-out', style({
                'visibility': 'hidden'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('1ms ease-in-out', style({
                'visibility': 'visible'
            })),
            animate('500ms ease-in-out', style({
                'width': '50%'
            })),
            animate('500ms ease-in-out', style({
                'opacity': '1'
            }))
        ]
        )])
    ]),
]

export const SlideInOutLogAnimation = [
  trigger('slideInOut', [
      state('in', style({
          'width': '30%', 'opacity': '1', 'visibility': 'visible'
      })),
      state('out', style({
          'width': '0px', 'opacity': '0', 'visibility': 'hidden'
      })),
      transition('in => out', [group([
          animate('500ms ease-in-out', style({
              'opacity': '0'
          })),
          animate('500ms ease-in-out', style({
              'width': '0px'
          })),
          animate('500ms ease-in-out', style({
              'visibility': 'hidden'
          }))
      ]
      )]),
      transition('out => in', [group([
          animate('1ms ease-in-out', style({
              'visibility': 'visible'
          })),
          animate('500ms ease-in-out', style({
              'width': '30%'
          })),
          animate('500ms ease-in-out', style({
              'opacity': '1'
          }))
      ]
      )])
  ]),
]

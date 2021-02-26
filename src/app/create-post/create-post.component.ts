import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concat, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostsService } from '../services/posts.service';
import { AuthorValidator } from './author.validator';
import { blockedAuthorValidator } from './blocked-author.validator';
import { explicitValidator } from './explicit.validator';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  public postForm: FormGroup;
  public maxContent: number = 50;
  public charsRemaining$: Observable<number>;

  constructor(private postService: PostsService, private fb: FormBuilder) {}

  ngOnInit() {
    this.postForm = this.fb.group(
      {
        author: [
          '',
          {
            validators: [
              Validators.required,
              Validators.pattern('^[A-Za-z ]*$'),
            ],
            updateOn: 'blur',
            asyncValidators: [blockedAuthorValidator(this.postService)],
          },
        ],
        title: ['', [Validators.required]],
        content: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(this.maxContent),
            explicitValidator,
          ],
        ],
      },
      { validators: AuthorValidator }
    );
    this.charsRemaining$ = concat(of(''), this.content.valueChanges).pipe(
      map((content) => {
        return this.maxContent - (content?.length || 0);
      })
    );
  }

  get author() {
    return this.postForm.get('author');
  }
  get title() {
    return this.postForm.get('title');
  }
  get content() {
    return this.postForm.get('content');
  }

  reset() {
    this.postForm.reset();
  }

  submitForm() {
    this.postService.addPost(this.postForm.value).subscribe(() => {
      this.reset();
    });
  }
}

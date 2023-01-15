import { Inject, Injectable, ConsoleLogger } from '@nestjs/common';
import { OnApplicationShutdown } from '@nestjs/common';
import { ClientOptions, Client } from '@sentry/types';
import * as Sentry from '@sentry/node';
import { SENTRY_MODULE_OPTIONS } from './sentry.constants';
import { SentryModuleOptions } from './sentry.interfaces';

@Injectable()
export class SentryService extends ConsoleLogger implements OnApplicationShutdown {
  app = '@dohyeong2/nestjs-sentry: ';
  private static serviceInstance: SentryService;
  constructor(
    @Inject(SENTRY_MODULE_OPTIONS)
    readonly opts?: SentryModuleOptions,
  ) {
    super();
    if (!(opts && opts.dsn)) {
      // console.log('options not found. Did you use SentryModule.forRoot?');
      return;
    }
    const { debug, integrations, ...sentryOptions } = opts;
    Sentry.init({
      ...sentryOptions,
      integrations,
    });
  }

  public static SentryServiceInstance(): SentryService {
    if (!SentryService.serviceInstance) {
      SentryService.serviceInstance = new SentryService();
    }
    return SentryService.serviceInstance;
  }

  log(message: string, context?: string, asBreadcrumb?: boolean) {
    message = `${this.app} ${message}`;
    try {
      super.log(message, context);
      asBreadcrumb ?
      Sentry.addBreadcrumb({
        message,
        level: 'log',
        data: {
          context
        }
      }) :
      Sentry.captureMessage(message, 'log');
    } catch (err) {}
  }

  error(message: string, trace?: string, context?: string) {
    message = `${this.app} ${message}`;
    try {
      super.error(message, trace, context);
      Sentry.captureMessage(message, 'error');
    } catch (err) {}
  }

  warn(message: string, context?: string, asBreadcrumb?: boolean) {
    message = `${this.app} ${message}`;
    try {
      super.warn(message, context);
      asBreadcrumb ?
      Sentry.addBreadcrumb({
        message,
        level: 'warning',
        data: {
          context
        }
      }) :
      Sentry.captureMessage(message, 'warning');
    } catch (err) {}
  }

  debug(message: string, context?: string, asBreadcrumb?: boolean) {
    message = `${this.app} ${message}`;
    try {
      super.debug(message, context);
      asBreadcrumb ?
      Sentry.addBreadcrumb({
        message,
        level: 'debug',
        data: {
          context
        }
      }) :
      Sentry.captureMessage(message, 'debug');
    } catch (err) {}
  }

  verbose(message: string, context?: string, asBreadcrumb?: boolean) {
    message = `${this.app} ${message}`;
    try {
      super.verbose(message, context);
      asBreadcrumb ?
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: {
          context
        }
      }) :
      Sentry.captureMessage(message, 'info');
    } catch (err) {}
  }

  instance() {
    return Sentry;
  }

  async onApplicationShutdown(signal?: string) {
    if (this.opts?.close?.enabled === true) {
      await Sentry.close(this.opts?.close.timeout);
    }
  }
}

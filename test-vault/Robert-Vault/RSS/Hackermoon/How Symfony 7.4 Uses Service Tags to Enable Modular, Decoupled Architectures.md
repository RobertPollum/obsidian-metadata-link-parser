---
title: "How Symfony 7.4 Uses Service Tags to Enable Modular, Decoupled Architectures"
link: https://hackernoon.com/how-symfony-74-uses-service-tags-to-enable-modular-decoupled-architectures?source=rss
author: MattLeads
publish_date: 2026-01-16 04:07:20
saved_date: 2026-01-17 15:10:00
image: https://hackernoon.com/https://cdn.hackernoon.com/images/pL08BO3ouKNkhrqPjjNqbI6Myh73-1w03dia.jpeg
tags: #symfony #php #symfony-7.4 #symfony-service-tags #tagged-iterator-symfony #service-locator-symfony #decoupled-architecture-php #open-closed-principle-php
---

![image](https://hackernoon.com/https://cdn.hackernoon.com/images/pL08BO3ouKNkhrqPjjNqbI6Myh73-1w03dia.jpeg)

Service tags in Symfony are often misunderstood as merely a mechanism for Event Listeners or Twig Extensions. While they excel at those tasks, their true power lies in **decoupling architecture**. When wielded correctly, tags allow you to build systems that are open for extension but closed for modification (Open-Closed Principle) without touching a single line of configuration files.

In this article, we will move beyond standard usage. We won’t just “tag a service”; we will build a robust, modular **Document Processing Pipeline** using Symfony 7.4, PHP 8.3+ and modern attributes. We will explore strictly typed tagged iterators, lazy-loading locators, custom domain-specific attributes and compiler passes for validation.

## A Modular Document Processor

Imagine we are building a system that ingests various document formats (PDF, CSV, JSON) and processes them. We want to add support for new formats simply by creating a new class — no YAML editing required.

First, let’s define our contract.

```php
// src/Contract/DocumentProcessorInterface.php
namespace App\Contract;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

/**
 * We use AutoconfigureTag so any class implementing this interface
 * is automatically tagged with 'app.document_processor'.
 */
#[AutoconfigureTag('app.document_processor')]
interface DocumentProcessorInterface
{
    public function supports(string $mimeType): bool;
    public function process(string $filePath): void;
    public static function getProcessorName(): string;
}
```

## The Modern Strategy Pattern: Tagged Iterators

The most common advanced pattern is injecting a collection of services. In older Symfony versions, this required a Compiler Pass. In Symfony 7.4, we use **#\[TaggedIterator\].**

Let’s create two processors.

```php
// src/Processor/PdfProcessor.php
namespace App\Processor;

use App\Contract\DocumentProcessorInterface;

class PdfProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return $mimeType === 'application/pdf';
    }

    public function process(string $filePath): void
    {
        // Logic to process PDF...
        echo "Processing PDF: $filePath\n";
    }

    public static function getProcessorName(): string
    {
        return 'pdf_v1';
    }
}
```

```php
// src/Processor/CsvProcessor.php
namespace App\Processor;

use App\Contract\DocumentProcessorInterface;

class CsvProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return $mimeType === 'text/csv';
    }

    public function process(string $filePath): void
    {
        echo "Processing CSV: $filePath\n";
    }

    public static function getProcessorName(): string
    {
        return 'csv_v1';
    }
}
```

Now, the **DocumentManager** that consumes these. We will use the **index\_by** option to create a **keyed collection**, which is vastly superior to a simple list when you need direct access or debugging clarity.

```php
// src/Service/DocumentManager.php
namespace App\Service;

use App\Contract\DocumentProcessorInterface;
use Symfony\Component\DependencyInjection\Attribute\TaggedIterator;

final readonly class DocumentManager
{
    /**
     * @param iterable<string, DocumentProcessorInterface> $processors
     */
    public function __construct(
        #[TaggedIterator(
            tag: 'app.document_processor', 
            indexAttribute: 'key', // We will learn how to populate this "key" dynamically later
            defaultIndexMethod: 'getProcessorName' // Fallback method on the class
        )]
        private iterable $processors
    ) {}

    public function processDocument(string $filePath, string $mimeType): void
    {
        // Because we used 'defaultIndexMethod', our iterable keys are now 'pdf_v1', 'csv_v1', etc.
        foreach ($this->processors as $key => $processor) {
            if ($processor->supports($mimeType)) {
                echo "Selected processor [$key]...\n";
                $processor->process($filePath);
                return;
            }
        }

        throw new \InvalidArgumentException("No processor found for $mimeType");
    }
}
```

The **defaultIndexMethod** allows the service itself to define its key in the collection. You **don’t need to define keys in services.yaml**

## Advanced: Custom Attributes for Domain-Specific Configuration

The previous example is clean, but generic. What if we want to attach metadata to our processors, such as a priority or a specific type, without implementing methods for every single piece of configuration?

We can create a **Custom PHP Attribute** that acts as a wrapper around the service tag.

### Create the Attribute

```php
// src/Attribute/AsDocumentProcessor.php
namespace App\Attribute;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[\Attribute(\Attribute::TARGET_CLASS)]
class AsDocumentProcessor extends AutoconfigureTag
{
    public function __construct(
        string $type,
        int $priority = 0
    ) {
        parent::__construct('app.document_processor', [
            'type' => $type,
            'priority' => $priority // Symfony automatically sorts by this attribute
        ]);
    }
}
```

By extending **AutoconfigureTag**, we inherit Symfony’s native ability to apply the tag automatically. We map our domain properties (type, priority) directly into the tag’s attributes array.

### Refactor Processors

Now our processors look semantic and declarative.

```php
// src/Processor/JsonProcessor.php
namespace App\Processor;

use App\Attribute\AsDocumentProcessor;
use App\Contract\DocumentProcessorInterface;

#[AsDocumentProcessor(type: 'json', priority: 10)]
class JsonProcessor implements DocumentProcessorInterface
{
    public function supports(string $mimeType): bool
    {
        return $mimeType === 'application/json';
    }

    public function process(string $filePath): void
    {
        echo "Processing JSON (Priority High)\n";
    }

    public static function getProcessorName(): string
    {
        return 'json_fast';
    }
}
```

If you inject **iterable $processors** now, the **JsonProcessor** will appear before others because of the **priority: 10**.

## Lazy Loading with #\[TaggedLocator\]

In large applications with dozens of processors, instantiating every single service just to find the one that supports application/pdf is memory-inefficient. This is where **Service Locators** come in.

A **ServiceLocator** is a mini-container that only holds the specific services you asked for and it only instantiates them when you explicitly call get().

```php
// src/Service/LazyDocumentManager.php
namespace App\Service;

use App\Contract\DocumentProcessorInterface;
use Symfony\Component\DependencyInjection\Attribute\TaggedLocator;
use Symfony\Component\DependencyInjection\ServiceLocator;

final readonly class LazyDocumentManager
{
    /**
     * @param ServiceLocator<DocumentProcessorInterface> $locator
     */
    public function __construct(
        #[TaggedLocator(
            tag: 'app.document_processor',
            indexAttribute: 'type' // Matches the 'type' key in our AsDocumentProcessor attribute
        )]
        private ServiceLocator $locator
    ) {}

    public function process(string $type, string $filePath): void
    {
        if (!$this->locator->has($type)) {
            throw new \InvalidArgumentException("No processor registered for type: $type");
        }

        // The service is instantiated ONLY here
        $processor = $this->locator->get($type);
        $processor->process($filePath);
    }
}
```

**The Magic:** Because our **AsDocumentProcessor** attribute passed \[‘type’ => ‘json’\] to the tag, **#\[TaggedLocator\]** can use **indexAttribute: ‘type’** to key the locator.

-   **$locator->get(‘json’)** returns the **JsonProcessor**.
-   If we never call **process(‘json’, …)**, the **JsonProcessor** is never created.

## Advanced Validation with Compiler Passes

Sometimes, attributes and standard injection aren’t enough. What if you need to ensure that no two processors claim the same ‘type’? Or if you need to wrap every processor in a generic **LoggerDecorator**?

This requires a Compiler Pass. This code runs during the container compilation phase (before the cache is frozen), allowing for powerful meta-programming.

```php
// src/DependencyInjection/Compiler/ProcessorValidatorPass.php
namespace App\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class ProcessorValidatorPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        $tag = 'app.document_processor';
        $services = $container->findTaggedServiceIds($tag);

        $seenTypes = [];

        foreach ($services as $id => $tags) {
            // A service might have multiple tags, iterate them
            foreach ($tags as $attributes) {
                if (!isset($attributes['type'])) {
                    continue; // Skip if using the interface Autoconfigure without the custom attribute
                }

                $type = $attributes['type'];

                if (isset($seenTypes[$type])) {
                    throw new \LogicException(sprintf(
                        'Duplicate document processor type "%s" detected in services "%s" and "%s".',
                        $type,
                        $seenTypes[$type],
                        $id
                    ));
                }

                $seenTypes[$type] = $id;
            }
        }
    }
}
```

**Registering the Compiler Pass**

```php
// src/Kernel.php
namespace App;

use App\DependencyInjection\Compiler\ProcessorValidatorPass;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    protected function build(ContainerBuilder $container): void
    {
        $container->addCompilerPass(new ProcessorValidatorPass());
    }
}
```

Now, if you copy **JsonProcessor** and forget to change type: ‘json’, the container will throw a clear, descriptive error during compilation (or cache warmup), preventing runtime bugs.

## The “Secret Sauce”: Dynamic Tag Configuration

There is one extremely advanced edge case: What if you want to use a custom attribute, but you cannot extend **AutoconfigureTag** (perhaps the attribute comes from a third-party library or you want to keep your Domain layer pure without Symfony dependencies)?

You can use **registerAttributeForAutoconfiguration** in the Kernel.

Let’s say you have this Pure PHP attribute:

```php
// src/Domain/Attribute/Worker.php
namespace App\Domain\Attribute;

#[\Attribute(\Attribute::TARGET_CLASS)]
class Worker
{
    public function __construct(
        public string $queueName,
        public int $retries = 3
    ) {}
}
```

This attribute knows nothing about Symfony. To make it useful, we bridge it in **Kernel.php**:

```php
// src/Kernel.php

// ... inside the build() method ...

$container->registerAttributeForAutoconfiguration(
    \App\Domain\Attribute\Worker::class,
    static function (
        \Symfony\Component\DependencyInjection\ChildDefinition $definition, 
        \App\Domain\Attribute\Worker $attribute, 
        \ReflectionClass $reflector
    ): void {
        // We dynamically add the tag based on the attribute
        $definition->addTag('app.worker', [
            'queue' => $attribute->queueName,
            'retries' => $attribute->retries
        ]);

        // We can even manipulate the service definition itself!
        $definition->addMethodCall('setMaxRetries', [$attribute->retries]);
    }
);
```

This is the pinnacle of decoupling. Your domain logic (Worker attribute) remains pure, while your infrastructure (Kernel) wires it into the framework.

## Verification

To verify your tags are working correctly, use the Symfony Console.

**List all tagged services:**

```bash
php bin/console debug:container --tag=app.document_processor
```

Output should list your **PdfProcessor**, **CsvProcessor** and **JsonProcessor**.

**Verify arguments mapping:**

```bash
php bin/console debug:container App\Service\DocumentManager
```

Look for the processors argument. It should show a **TaggedIterator** object.

**Test the Compiler Pass: Temporarily add a duplicate type: ‘json’ to another class and run:**

```bash
php bin/console cache:clear
```

You should see the **LogicException** we defined.

## Conclusion

We have traveled far beyond simple event listeners. We have:

1.  Defined **contracts** using **#\[AutoconfigureTag\]**.
2.  Built **typed**, **prioritized collections** with **#\[TaggedIterator\]**.
3.  Optimized performance with **lazy-loading #\[TaggedLocator\]**.
4.  Enforced architecture rules with **Compiler Passes**.
5.  Bridged **Pure PHP Attributes** to Symfony Tags.

This approach creates applications that are easy to test, easy to extend and remarkably clean to read.

If you found this deep dive into Symfony internals helpful, let’s connect on LinkedIn \[**[https://www.linkedin.com/in/matthew-mochalkin/](https://www.linkedin.com/in/matthew-mochalkin/)**\]. I share advanced PHP and architecture insights weekly.

\\